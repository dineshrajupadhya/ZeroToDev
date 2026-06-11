import os
import uuid
import re
import json
from collections import Counter
from urllib.parse import urlparse

from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from rag import (
    ingest_documents, ask_question, get_collection_stats,
    delete_documents_by_source, list_documents, SUPPORTED_EXTENSIONS,
    get_vectorstore,
)
from config import UPLOAD_DIR

app = FastAPI(title="DocQA Chatbot API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AskRequest(BaseModel):
    question: str
    collection: str = "docs"
    chat_history: list = []


class ChatMessage(BaseModel):
    role: str
    content: str


class AskResponse(BaseModel):
    answer: str
    sources: list


class UploadResponse(BaseModel):
    filename: str
    chunks: int
    message: str


class BatchUploadResponse(BaseModel):
    files: list
    total_chunks: int


class StatsResponse(BaseModel):
    total_chunks: int
    collection_name: str


class DeleteRequest(BaseModel):
    filename: str
    collection: str = "docs"


class DocItem(BaseModel):
    name: str
    full_path: str
    chunks: int


class ChunkItem(BaseModel):
    id: str
    content: str
    source: str
    page: int


class SummarizeRequest(BaseModel):
    text: str


class ScrapeRequest(BaseModel):
    url: str


class AnalyticsResponse(BaseModel):
    total_words: int
    total_sentences: int
    total_paragraphs: int
    avg_word_length: float
    top_words: list
    word_count_by_source: dict


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/supported-types")
def supported_types():
    return {"types": SUPPORTED_EXTENSIONS}


@app.post("/upload", response_model=UploadResponse)
async def upload_document(file: UploadFile = File(...), collection: str = "docs"):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type {ext} not supported. Use: {list(SUPPORTED_EXTENSIONS.keys())}"
        )

    file_id = uuid.uuid4().hex
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}{ext}")

    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    try:
        chunks = ingest_documents(file_path, collection)
    finally:
        os.remove(file_path)

    return UploadResponse(
        filename=file.filename,
        chunks=chunks,
        message=f"Successfully ingested {chunks} chunks from {file.filename}",
    )


@app.post("/upload/batch", response_model=BatchUploadResponse)
async def upload_batch(files: list[UploadFile] = File(...), collection: str = "docs"):
    results = []
    total_chunks = 0

    for file in files:
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in SUPPORTED_EXTENSIONS:
            results.append({"filename": file.filename, "status": "skipped", "reason": f"Unsupported type: {ext}"})
            continue

        file_id = uuid.uuid4().hex
        file_path = os.path.join(UPLOAD_DIR, f"{file_id}{ext}")

        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)

        try:
            chunks = ingest_documents(file_path, collection)
            total_chunks += chunks
            results.append({"filename": file.filename, "status": "ok", "chunks": chunks})
        except Exception as e:
            results.append({"filename": file.filename, "status": "error", "reason": str(e)})
        finally:
            if os.path.exists(file_path):
                os.remove(file_path)

    return BatchUploadResponse(files=results, total_chunks=total_chunks)


@app.post("/ask", response_model=AskResponse)
def ask(req: AskRequest):
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    stats = get_collection_stats(req.collection)
    if stats["total_chunks"] == 0:
        return AskResponse(
            answer="No documents uploaded yet. Please upload a document first (PDF, TXT, DOCX, CSV, or MD) in the Documents tab, then ask your question.",
            sources=[],
        )

    history_text = ""
    if req.chat_history:
        for msg in req.chat_history[-6:]:
            role = "Human" if msg.get("role") == "user" else "Assistant"
            history_text += f"{role}: {msg.get('content', '')}\n"

    result = ask_question(req.question, req.collection, history=history_text)
    return AskResponse(answer=result["answer"], sources=result["sources"])


@app.get("/stats/{collection}", response_model=StatsResponse)
def stats(collection: str = "docs"):
    return get_collection_stats(collection)


@app.get("/documents", response_model=list[DocItem])
def get_documents(collection: str = "docs"):
    return list_documents(collection)


@app.post("/delete")
def delete_document(req: DeleteRequest):
    deleted = delete_documents_by_source(req.filename, req.collection)
    if deleted == 0:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"message": f"Deleted {deleted} chunks from {req.filename}", "deleted": deleted}


@app.get("/chunks", response_model=list[ChunkItem])
def get_chunks(collection: str = "docs", source: str = "", limit: int = 50):
    vectorstore = get_vectorstore(collection)
    collection_obj = vectorstore._collection

    if source:
        all_docs = collection_obj.get(where={"source": source})
    else:
        all_docs = collection_obj.get()

    chunks = []
    for i in range(min(limit, len(all_docs["ids"]))):
        chunks.append(ChunkItem(
            id=all_docs["ids"][i],
            content=all_docs["documents"][i],
            source=os.path.basename(all_docs["metadatas"][i].get("source", "unknown")),
            page=all_docs["metadatas"][i].get("page", 0),
        ))
    return chunks


@app.post("/summarize")
def summarize(req: SummarizeRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    from rag import get_llm
    llm = get_llm()

    prompt = f"""Summarize the following text in a clear and concise way. Cover the key points:

{req.text}

Summary:"""

    result = llm.invoke(prompt)
    answer = result if isinstance(result, str) else result.get("text", str(result))
    return {"summary": answer}


@app.post("/scrape")
def scrape_url(req: ScrapeRequest):
    url = req.url.strip()
    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    try:
        import requests as req_lib
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
        response = req_lib.get(url, headers=headers, timeout=15)
        response.raise_for_status()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch URL: {str(e)}")

    from bs4 import BeautifulSoup
    soup = BeautifulSoup(response.text, "html.parser")

    for tag in soup(["script", "style", "nav", "footer", "header", "aside"]):
        tag.decompose()

    title = soup.title.string if soup.title else "No title"
    text = soup.get_text(separator="\n", strip=True)
    text = re.sub(r'\n{3,}', '\n\n', text)

    links = []
    for a in soup.find_all("a", href=True)[:20]:
        links.append({"text": a.get_text(strip=True)[:100], "href": a["href"]})

    return {
        "title": title,
        "text": text[:50000],
        "text_length": len(text),
        "links": links,
    }


@app.get("/analytics")
def get_analytics(collection: str = "docs"):
    vectorstore = get_vectorstore(collection)
    collection_obj = vectorstore._collection
    all_docs = collection_obj.get()

    if not all_docs["documents"]:
        return {"total_words": 0, "total_sentences": 0, "total_paragraphs": 0,
                "avg_word_length": 0, "top_words": [], "word_count_by_source": {}}

    full_text = " ".join(all_docs["documents"])

    words = re.findall(r'\b[a-zA-Z]+\b', full_text.lower())
    word_count = len(words)
    avg_word_length = sum(len(w) for w in words) / max(len(words), 1)
    sentences = len(re.split(r'[.!?]+', full_text))
    paragraphs = len(re.split(r'\n\s*\n', full_text))

    stopwords = {"the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
                 "have", "has", "had", "do", "does", "did", "will", "would", "could",
                 "should", "may", "might", "shall", "can", "to", "of", "in", "for",
                 "on", "with", "at", "by", "from", "as", "into", "through", "during",
                 "before", "after", "above", "below", "between", "and", "but", "or",
                 "not", "no", "nor", "so", "yet", "both", "either", "neither", "each",
                 "every", "all", "any", "few", "more", "most", "other", "some", "such",
                 "than", "too", "very", "just", "about", "also", "this", "that", "these",
                 "those", "i", "me", "my", "we", "our", "you", "your", "he", "him", "his",
                 "she", "her", "it", "its", "they", "them", "their", "what", "which", "who",
                 "whom", "when", "where", "why", "how", "if", "then", "else", "new", "one",
                 "two", "three", "first", "second", "use", "using", "used", "etc", "com"}

    filtered = [w for w in words if w not in stopwords and len(w) > 2]
    top_words = Counter(filtered).most_common(20)

    source_counts = {}
    for doc in all_docs["documents"]:
        src = "unknown"
        source_counts[src] = source_counts.get(src, 0) + len(doc.split())

    return {
        "total_words": word_count,
        "total_sentences": sentences,
        "total_paragraphs": paragraphs,
        "avg_word_length": round(avg_word_length, 1),
        "top_words": [{"word": w, "count": c} for w, c in top_words],
        "word_count_by_source": source_counts,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
