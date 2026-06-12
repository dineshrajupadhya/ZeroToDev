import os
import traceback
from langchain_community.document_loaders import PyPDFLoader, TextLoader, CSVLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.language_models.llms import LLM
from langchain_core.callbacks import CallbackManagerForLLMRun
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

from config import (
    OPENAI_API_KEY, EMBEDDING_MODEL, CHUNK_SIZE,
    CHUNK_OVERLAP, VECTORSTORE_DIR
)

_llm = None
_embedding_model = None
_llm_error = None


class FlanT5LLM(LLM):
    model_id: str = "google/flan-t5-small"
    model: object = None
    tokenizer: object = None

    @property
    def _llm_type(self) -> str:
        return "flan-t5"

    def _call(
        self,
        prompt: str,
        stop: list[str] | None = None,
        run_manager: CallbackManagerForLLMRun | None = None,
        **kwargs,
    ) -> str:
        inputs = self.tokenizer(prompt, return_tensors="pt", max_length=512, truncation=True)
        outputs = self.model.generate(**inputs, max_new_tokens=256)
        return self.tokenizer.decode(outputs[0], skip_special_tokens=True)

    @classmethod
    def from_pretrained(cls, model_id: str = "google/flan-t5-small") -> "FlanT5LLM":
        tokenizer = AutoTokenizer.from_pretrained(model_id)
        model = AutoModelForSeq2SeqLM.from_pretrained(model_id)
        instance = cls(model_id=model_id, model=model, tokenizer=tokenizer)
        return instance


def get_embeddings():
    global _embedding_model
    if _embedding_model is not None:
        return _embedding_model
    try:
        if OPENAI_API_KEY:
            from langchain_openai import OpenAIEmbeddings
            _embedding_model = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)
        else:
            _embedding_model = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)
        return _embedding_model
    except Exception as e:
        raise RuntimeError(f"Failed to load embeddings: {e}")


def get_llm():
    global _llm, _llm_error
    if _llm is not None:
        return _llm
    if _llm_error is not None:
        raise RuntimeError(f"LLM previously failed to load: {_llm_error}")
    try:
        if OPENAI_API_KEY:
            from langchain_openai import ChatOpenAI
            _llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0, openai_api_key=OPENAI_API_KEY)
        else:
            _llm = FlanT5LLM.from_pretrained("google/flan-t5-small")
        return _llm
    except Exception as e:
        _llm_error = str(e)
        raise RuntimeError(f"Failed to load LLM: {e}")


def get_llm_status():
    return {
        "loaded": _llm is not None,
        "error": _llm_error,
    }


SUPPORTED_EXTENSIONS = {
    ".pdf": "PDF Document",
    ".txt": "Text File",
    ".docx": "Word Document",
    ".csv": "CSV File",
    ".md": "Markdown File",
}


def load_document(file_path: str):
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".pdf":
        return PyPDFLoader(file_path).load()
    elif ext == ".txt":
        return TextLoader(file_path).load()
    elif ext == ".docx":
        import docx2txt
        text = docx2txt.process(file_path)
        from langchain.schema import Document
        return [Document(page_content=text, metadata={"source": os.path.basename(file_path)})]
    elif ext == ".csv":
        return CSVLoader(file_path).load()
    elif ext == ".md":
        return TextLoader(file_path).load()
    else:
        raise ValueError(f"Unsupported file type: {ext}")


def split_documents(docs):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        length_function=len,
    )
    return splitter.split_documents(docs)


def get_vectorstore(collection_name: str = "docs") -> Chroma:
    embeddings = get_embeddings()
    return Chroma(
        collection_name=collection_name,
        embedding_function=embeddings,
        persist_directory=VECTORSTORE_DIR,
    )


def ingest_documents(file_path: str, collection_name: str = "docs") -> int:
    docs = load_document(file_path)
    chunks = split_documents(docs)
    vectorstore = get_vectorstore(collection_name)
    vectorstore.add_documents(chunks)
    return len(chunks)


def delete_documents_by_source(source_name: str, collection_name: str = "docs") -> int:
    vectorstore = get_vectorstore(collection_name)
    collection = vectorstore._collection
    results = collection.get(where={"source": source_name})
    if results["ids"]:
        collection.delete(ids=results["ids"])
    return len(results["ids"])


def list_documents(collection_name: str = "docs") -> list:
    vectorstore = get_vectorstore(collection_name)
    collection = vectorstore._collection
    all_docs = collection.get()
    sources = {}
    for i, meta in enumerate(all_docs["metadatas"]):
        src = meta.get("source", "unknown")
        if src not in sources:
            sources[src] = 0
        sources[src] += 1
    return [{"name": os.path.basename(k), "full_path": k, "chunks": v} for k, v in sources.items()]


def ask_question(question: str, collection_name: str = "docs", history: str = "") -> dict:
    vectorstore = get_vectorstore(collection_name)
    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

    context_docs = retriever.invoke(question)
    context_text = "\n\n".join([d.page_content for d in context_docs])

    history_block = f"Conversation history:\n{history}\n\n" if history else ""

    prompt = f"""Answer the question based on the context below. Be helpful and detailed. If the answer is not in the context, say "I don't have enough information."

{history_block}Context: {context_text}

Question: {question}

Answer:"""

    llm = get_llm()
    result = llm.invoke(prompt)

    sources = []
    for doc in context_docs:
        sources.append({
            "content": doc.page_content[:300],
            "metadata": doc.metadata,
        })

    answer = result if isinstance(result, str) else result.get("text", str(result))

    return {
        "answer": answer,
        "sources": sources,
    }


def get_collection_stats(collection_name: str = "docs") -> dict:
    vectorstore = get_vectorstore(collection_name)
    collection = vectorstore._collection
    return {
        "total_chunks": collection.count(),
        "collection_name": collection_name,
    }
