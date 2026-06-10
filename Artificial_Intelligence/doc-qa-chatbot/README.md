# DocQA Chatbot

A Document Q&A Chatbot using RAG (Retrieval-Augmented Generation). Upload documents, scrape URLs, ask questions, and get AI-powered answers with source references.

## Live Demo

**Hosted on HuggingFace Spaces:** https://dineshupadhya-docqa-chatbot.hf.space

## Features

- **Batch Upload** - Upload multiple PDF, DOCX, TXT, CSV, MD files at once
- **Chat with Memory** - Follow-up questions with conversation history
- **Auto-Summarize** - Generate summaries of uploaded documents
- **URL Scraper** - Scrape any webpage and ask questions about its content
- **Document Analytics** - Word count, top words, charts
- **Chunk Viewer** - Browse and search all text chunks
- **Delete Documents** - Remove individual documents from the vector store
- **Export Chat** - Download conversation as text file
- **Source Citations** - Answers linked back to original document sections

## Tech Stack

- **Backend:** FastAPI, LangChain, ChromaDB, BeautifulSoup
- **Frontend:** Streamlit
- **Embeddings:** HuggingFace all-MiniLM-L6-v2 (free)
- **LLM:** HuggingFace Flan-T5-small (free) or OpenAI GPT-3.5-turbo
- **Deployment:** HuggingFace Spaces (Docker)

## Quick Start

### Local Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Start backend (Terminal 1)
cd backend
python run.py

# Start frontend (Terminal 2)
cd frontend
streamlit run app.py
```

Open http://localhost:8501

### Docker Setup

```bash
docker build -t docqa-chatbot .
docker run -p 7860:7860 docqa-chatbot
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload a document |
| POST | `/api/upload/batch` | Upload multiple documents |
| POST | `/api/ask` | Ask a question |
| POST | `/api/summarize` | Summarize text |
| POST | `/api/scrape` | Scrape a URL |
| GET | `/api/documents` | List all documents |
| GET | `/api/chunks` | Browse text chunks |
| GET | `/api/analytics` | Document analytics |
| GET | `/api/health` | Health check |

## Project Structure

```
doc-qa-chatbot/
├── backend/
│   ├── main.py          # FastAPI server
│   ├── rag.py           # RAG pipeline
│   ├── config.py        # Configuration
│   └── run.py           # Dev runner
├── frontend/
│   └── app.py           # Streamlit UI
├── Dockerfile           # Container build
├── nginx.conf           # Reverse proxy
├── supervisord.conf     # Process manager
└── requirements.txt     # All dependencies
```
