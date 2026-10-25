from app.rag.documents import load_knowledge_base_documents
from app.rag.engine import RAGEngine

def test_document_loader():
    docs = load_knowledge_base_documents()
    assert len(docs) > 0
    first = docs[0]
    assert "title" in first
    assert "content" in first
    assert "source_url" in first
    assert "verified_date" in first

def test_rag_retrieval():
    engine = RAGEngine()
    engine.initialize()
    results = engine.retrieve("emergency 112 police contact", top_k=2)
    assert len(results) > 0
    top_doc, score = results[0]
    assert "112" in top_doc["title"] or "112" in top_doc["content"]

def test_rag_generation_fallback(monkeypatch):
    import app.config as config
    monkeypatch.setattr(config, "get_gemini_api_key", lambda: "")
    engine = RAGEngine()
    engine.initialize()
    res = engine.generate_response("How to report impersonation account?")
    assert len(res["sources"]) > 0
    assert res["isGrounded"] is True
    assert "SafeSignal" in res["model"]
