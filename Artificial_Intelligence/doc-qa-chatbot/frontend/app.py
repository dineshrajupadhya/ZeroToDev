import streamlit as st
import requests
import json
import re
import os
from datetime import datetime

API_URL = os.environ.get("API_URL", "http://localhost:8000")
TIMEOUT = 120

st.set_page_config(page_title="DocQA Chatbot", page_icon=":books:", layout="wide")

st.markdown("""
<style>
.source-highlight { background: #fff3cd; padding: 2px 4px; border-radius: 3px; }
.chunk-card { background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 12px; margin: 8px 0; }
</style>
""", unsafe_allow_html=True)

st.title("DocQA Chatbot")
st.caption("Upload documents, scrape URLs, ask questions, get insights")

if "messages" not in st.session_state:
    st.session_state.messages = []
if "uploaded_files_list" not in st.session_state:
    st.session_state.uploaded_files_list = []

tab_chat, tab_docs, tab_chunks, tab_analytics, tab_scrape = st.tabs(
    ["Chat", "Documents", "Chunks", "Analytics", "URL Scraper"]
)

# ── TAB: Chat ──────────────────────────────────────────────────
with tab_chat:
    c1, c2 = st.columns([1, 2])

    with c1:
        st.subheader("Upload")
        uploaded_files = st.file_uploader(
            "Choose files",
            type=["pdf", "txt", "docx", "csv", "md"],
            accept_multiple_files=True,
        )
        if uploaded_files and st.button("Upload All", use_container_width=True):
            with st.spinner("Processing..."):
                try:
                    files = [("files", (f.name, f.getvalue())) for f in uploaded_files]
                    res = requests.post(f"{API_URL}/upload/batch", files=files, timeout=TIMEOUT)
                    if res.status_code == 200:
                        data = res.json()
                        for f in data["files"]:
                            if f["status"] == "ok":
                                st.success(f"{f['filename']}: {f['chunks']} chunks")
                            else:
                                st.warning(f"{f['filename']}: {f.get('reason', 'error')}")
                        st.info(f"Total chunks: {data['total_chunks']}")
                        st.session_state.uploaded_files_list = []
                    else:
                        st.error(res.json().get("detail", "Upload failed"))
                except Exception as e:
                    st.error(f"Error: {e}")

        st.divider()
        st.subheader("Auto-Summarize")
        if st.button("Summarize Uploaded Docs", use_container_width=True):
            with st.spinner("Summarizing..."):
                try:
                    res = requests.get(f"{API_URL}/chunks?limit=20", timeout=30)
                    if res.status_code == 200:
                        chunks = res.json()
                        all_text = "\n".join([c["content"] for c in chunks])
                        res2 = requests.post(f"{API_URL}/summarize", json={"text": all_text[:4000]}, timeout=TIMEOUT)
                        if res2.status_code == 200:
                            st.write(res2.json()["summary"])
                        else:
                            st.error("Summarize failed")
                except Exception as e:
                    st.error(f"Error: {e}")

        st.divider()
        st.subheader("Voice Input")
        if st.button("Start Voice Input", use_container_width=True):
            st.info("Click the microphone icon in the chat input box below (browser only)")

    with c2:
        st.subheader("Chat")

        for msg in st.session_state.messages:
            with st.chat_message(msg["role"]):
                st.write(msg["content"])
                if "timestamp" in msg:
                    st.caption(msg["timestamp"])
                if "sources" in msg and msg["sources"]:
                    with st.expander("Sources"):
                        for src in msg["sources"]:
                            st.markdown(f"**[{src['metadata'].get('source', 'unknown')}]**")
                            st.text(src["content"])

        question = st.chat_input("Ask something... (or click mic above for voice)")

        st.markdown("""
        <script>
        const chatInput = window.parent.document.querySelector('[data-testid="stChatInput"] textarea');
        if (chatInput && !window._micAdded) {
            window._micAdded = true;
        }
        </script>
        """, unsafe_allow_html=True)

        if question:
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            st.session_state.messages.append({"role": "user", "content": question, "timestamp": timestamp})
            with st.chat_message("user"):
                st.write(question)
                st.caption(timestamp)

            with st.chat_message("assistant"):
                with st.spinner("Thinking..."):
                    try:
                        history = [{"role": m["role"], "content": m["content"]}
                                   for m in st.session_state.messages[:-1]
                                   if m["role"] in ("user", "assistant")]
                        res = requests.post(f"{API_URL}/ask", json={
                            "question": question,
                            "collection": "docs",
                            "chat_history": history[-6:],
                        }, timeout=TIMEOUT)
                        if res.status_code == 200:
                            data = res.json()
                            answer = data["answer"]
                            st.write(answer)
                            if data["sources"]:
                                with st.expander("Sources"):
                                    for src in data["sources"]:
                                        st.markdown(f"**[{src['metadata'].get('source', 'unknown')}]**")
                                        st.text(src["content"])
                            st.session_state.messages.append({
                                "role": "assistant", "content": answer,
                                "sources": data["sources"],
                                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                            })
                        else:
                            error = res.json().get("detail", "Error") if res.text else f"Error {res.status_code}"
                            st.error(error)
                    except Exception as e:
                        st.error(f"Error: {e}")

        st.divider()
        col_clear, col_export = st.columns(2)
        with col_clear:
            if st.button("Clear Chat", use_container_width=True):
                st.session_state.messages = []
                st.rerun()
        with col_export:
            if st.session_state.messages:
                chat_text = ""
                for msg in st.session_state.messages:
                    role = "You" if msg["role"] == "user" else "AI"
                    ts = msg.get("timestamp", "")
                    chat_text += f"[{ts}] {role}: {msg['content']}\n\n"
                st.download_button("Export Chat", chat_text,
                    file_name=f"chat_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt",
                    mime="text/plain", use_container_width=True)

# ── TAB: Documents ─────────────────────────────────────────────
with tab_docs:
    st.subheader("Uploaded Documents")

    if st.button("Refresh", key="refresh_docs"):
        try:
            res = requests.get(f"{API_URL}/documents", timeout=10)
            if res.status_code == 200:
                st.session_state.uploaded_files_list = res.json()
        except Exception:
            pass

    docs = st.session_state.uploaded_files_list
    if docs:
        for doc in docs:
            col1, col2, col3 = st.columns([4, 1, 1])
            with col1:
                st.write(f"**{doc['name']}**")
            with col2:
                st.caption(f"{doc['chunks']} chunks")
            with col3:
                if st.button("Delete", key=f"del_{doc['name']}"):
                    try:
                        requests.post(f"{API_URL}/delete", json={"filename": doc["full_path"]}, timeout=10)
                        st.session_state.uploaded_files_list = []
                        st.rerun()
                    except Exception:
                        st.error("Delete failed")
    else:
        st.info("No documents uploaded. Go to Chat tab to upload.")

# ── TAB: Chunks ────────────────────────────────────────────────
with tab_chunks:
    st.subheader("Document Chunks")

    source_filter = st.text_input("Filter by source filename (optional)")
    limit = st.slider("Max chunks to show", 10, 200, 50)

    if st.button("Load Chunks"):
        with st.spinner("Loading..."):
            try:
                params = f"?limit={limit}"
                if source_filter:
                    params += f"&source={source_filter}"
                res = requests.get(f"{API_URL}/chunks{params}", timeout=30)
                if res.status_code == 200:
                    chunks = res.json()
                    st.info(f"Showing {len(chunks)} chunks")
                    for i, chunk in enumerate(chunks):
                        with st.expander(f"Chunk {i+1} | {chunk['source']} | Page {chunk['page']}"):
                            st.text(chunk["content"])
                else:
                    st.error("Failed to load chunks")
            except Exception as e:
                st.error(f"Error: {e}")

# ── TAB: Analytics ─────────────────────────────────────────────
with tab_analytics:
    st.subheader("Document Analytics")

    if st.button("Generate Analytics"):
        with st.spinner("Analyzing..."):
            try:
                res = requests.get(f"{API_URL}/analytics", timeout=30)
                if res.status_code == 200:
                    data = res.json()

                    col1, col2, col3, col4 = st.columns(4)
                    col1.metric("Words", f"{data['total_words']:,}")
                    col2.metric("Sentences", f"{data['total_sentences']:,}")
                    col3.metric("Paragraphs", f"{data['total_paragraphs']:,}")
                    col4.metric("Avg Word Length", data['avg_word_length'])

                    if data["top_words"]:
                        st.subheader("Top Words")
                        words_df = [{"Word": w["word"], "Count": w["count"]} for w in data["top_words"]]
                        st.bar_chart(words_df, x="Word", y="Count")

                    if data["word_count_by_source"]:
                        st.subheader("Words by Source")
                        source_df = [{"Source": s, "Words": c} for s, c in data["word_count_by_source"].items()]
                        st.bar_chart(source_df, x="Source", y="Words")
                else:
                    st.error("Failed to load analytics")
            except Exception as e:
                st.error(f"Error: {e}")

# ── TAB: URL Scraper ──────────────────────────────────────────
with tab_scrape:
    st.subheader("URL Scraper & Analyzer")

    url = st.text_input("Enter URL to scrape")
    if url and st.button("Scrape & Analyze"):
        with st.spinner("Scraping..."):
            try:
                res = requests.post(f"{API_URL}/scrape", json={"url": url}, timeout=30)
                if res.status_code == 200:
                    data = res.json()
                    st.success(f"Scraped: {data['title']} ({data['text_length']:,} chars)")

                    with st.expander("Page Content"):
                        st.text(data["text"][:5000])

                    if data["links"]:
                        with st.expander(f"Links ({len(data['links'])})"):
                            for link in data["links"]:
                                st.markdown(f"[{link['text'][:60]}]({link['href']})")

                    st.divider()
                    if st.button("Summarize Scraped Content"):
                        with st.spinner("Summarizing..."):
                            try:
                                res2 = requests.post(f"{API_URL}/summarize",
                                    json={"text": data["text"][:4000]}, timeout=TIMEOUT)
                                if res2.status_code == 200:
                                    st.write(res2.json()["summary"])
                            except Exception as e:
                                st.error(f"Summarize error: {e}")

                    if st.button("Ask about this URL"):
                        st.session_state.messages.append({
                            "role": "user",
                            "content": f"Analyze this content: {data['text'][:2000]}",
                        })
                        st.info("Content loaded. Go to Chat tab to ask questions about it.")
                else:
                    st.error(res.json().get("detail", "Scrape failed"))
            except Exception as e:
                st.error(f"Error: {e}")
