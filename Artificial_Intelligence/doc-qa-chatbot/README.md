# DocQA Chatbot

A Document Q&A Chatbot using RAG (Retrieval-Augmented Generation). Upload documents and ask questions to get AI-powered answers with source references.

## Features

- Upload PDF, DOCX, or TXT files
- Automatic text chunking and embedding
- Vector storage with ChromaDB
- Question answering with source citations
- Two LLM options: OpenAI (paid) or HuggingFace (free)
- Clean Streamlit chat interface

## Tech Stack

- **Backend:** FastAPI, LangChain, ChromaDB
- **Frontend:** Streamlit
- **Embeddings:** HuggingFace (free) or OpenAI
- **LLM:** OpenAI GPT-3.5-turbo or HuggingFace Flan-T5

## Quick Start

### 1. Setup Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env` — either add your OpenAI key or leave it empty to use free HuggingFace models.

Start the backend:
```bash
python main.py
```

### 2. Setup Frontend

```bash
cd frontend
pip install -r requirements.txt
streamlit run app.py
```

### 3. Use

1. Open http://localhost:8501
2. Upload a document (PDF, DOCX, or TXT)
3. Ask questions about the document

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload` | Upload a document |
| POST | `/ask` | Ask a question |
| GET | `/stats/{collection}` | Get collection stats |
| GET | `/health` | Health check |

## Project Structure

```
doc-qa-chatbot/
├── backend/
│   ├── main.py          # FastAPI server
│   ├── rag.py           # RAG pipeline
│   ├── config.py        # Configuration
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── app.py           # Streamlit UI
│   └── requirements.txt
├── vectorstore/         # ChromaDB storage
└── README.md
```

## LLM Options

| Option | Cost | Quality | Setup |
|--------|------|---------|-------|
| HuggingFace (free) | Free | Good | No API key needed |
| OpenAI | ~$0.001/query | Best | Requires API key |
