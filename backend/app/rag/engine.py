import os
import re
import logging
from typing import List, Dict, Any, Tuple
import numpy as np

from app.rag.documents import load_knowledge_base_documents
from app.config import get_gemini_api_key, EMBEDDING_MODEL_NAME

logger = logging.getLogger(__name__)

# Try to import FAISS and sentence_transformers
FAISS_AVAILABLE = False
SENTENCE_TRANSFORMERS_AVAILABLE = False

try:
    import faiss
    FAISS_AVAILABLE = True
except ImportError:
    logger.warning("FAISS not available. Using numpy cosine similarity indexer.")

try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    logger.warning("SentenceTransformers not available. Using keyword/TF-IDF retrieval fallback.")


class RAGEngine:
    def __init__(self):
        self.documents: List[Dict[str, Any]] = []
        self.encoder = None
        self.faiss_index = None
        self.doc_embeddings = None
        self.is_initialized = False

    def initialize(self):
        """Load knowledge base documents and build vector index."""
        logger.info("Initializing SafeSignal RAG Engine...")
        self.documents = load_knowledge_base_documents()

        if not self.documents:
            logger.warning("No documents loaded into RAG engine.")
            self.is_initialized = True
            return

        texts = [f"{d['title']}. {d['content']}" for d in self.documents]

        # Attempt to load SentenceTransformer
        if SENTENCE_TRANSFORMERS_AVAILABLE:
            try:
                logger.info(f"Loading embedding model: {EMBEDDING_MODEL_NAME}")
                self.encoder = SentenceTransformer(EMBEDDING_MODEL_NAME)
                embeddings = self.encoder.encode(texts, convert_to_numpy=True, normalize_embeddings=True)
                self.doc_embeddings = embeddings.astype('float32')

                if FAISS_AVAILABLE:
                    dim = self.doc_embeddings.shape[1]
                    self.faiss_index = faiss.IndexFlatIP(dim)
                    self.faiss_index.add(self.doc_embeddings)
                    logger.info(f"FAISS IndexFlatIP initialized with {self.faiss_index.ntotal} vectors of dimension {dim}.")
                else:
                    logger.info("Using normalized numpy dot-product for vector retrieval.")
            except Exception as e:
                logger.error(f"Failed to load SentenceTransformer: {e}. Falling back to lexical retriever.")
                self.encoder = None

        self.is_initialized = True
        logger.info("SafeSignal RAG Engine initialization complete.")

    def retrieve(self, query: str, top_k: int = 3) -> List[Tuple[Dict[str, Any], float]]:
        """
        Retrieve the top-k most relevant documents for a query.
        Returns a list of (document, relevance_score) tuples.
        """
        if not self.documents:
            return []

        # Vector retrieval via FAISS or numpy
        if self.encoder and self.doc_embeddings is not None:
            try:
                q_emb = self.encoder.encode([query], convert_to_numpy=True, normalize_embeddings=True).astype('float32')
                
                if self.faiss_index is not None:
                    scores, indices = self.faiss_index.search(q_emb, min(top_k, len(self.documents)))
                    results = []
                    for score, idx in zip(scores[0], indices[0]):
                        if idx != -1 and idx < len(self.documents):
                            results.append((self.documents[idx], float(score)))
                    return results
                else:
                    # Numpy cosine dot product
                    scores = np.dot(self.doc_embeddings, q_emb[0])
                    top_indices = np.argsort(scores)[::-1][:top_k]
                    return [(self.documents[i], float(scores[i])) for i in top_indices]
            except Exception as e:
                logger.error(f"Vector search failed: {e}. Using keyword fallback.")

        # Lexical / keyword scoring fallback
        q_tokens = set(re.findall(r'\w+', query.lower()))
        scored_docs = []
        for doc in self.documents:
            score = 0.0
            doc_text = (doc['title'] + " " + doc['content'] + " " + " ".join(doc.get('keywords', []))).lower()
            doc_tokens = set(re.findall(r'\w+', doc_text))
            
            # Intersection score
            common = q_tokens.intersection(doc_tokens)
            score += len(common) * 1.5

            # Keyword bonus
            for kw in doc.get("keywords", []):
                if kw in query.lower():
                    score += 3.0

            scored_docs.append((doc, score))

        scored_docs.sort(key=lambda x: x[1], reverse=True)
        return scored_docs[:top_k]

    def generate_response(self, query: str) -> Dict[str, Any]:
        """
        Produce a grounded answer using retrieved documents.
        Uses Gemini LLM if API key is configured, otherwise high-precision grounded synthesis.
        """
        retrieved = self.retrieve(query, top_k=3)
        sources = []
        context_blocks = []

        for doc, score in retrieved:
            sources.append({
                "id": doc.get("id"),
                "title": doc.get("title", ""),
                "url": doc.get("source_url", "https://cybercrime.gov.in"),
                "sourceType": doc.get("source_type", "Official Government"),
                "verifiedDate": doc.get("verified_date", "2026-02-15"),
                "relevance_score": round(score, 3)
            })
            context_blocks.append(f"Title: {doc['title']}\nSource: {doc['source_name']} ({doc['source_url']})\nContent: {doc['content']}")

        # 1. If Gemini API key is provided, attempt generative synthesis
        gemini_key = get_gemini_api_key()
        if gemini_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=gemini_key)

                model_name = "gemini-2.5-flash"
                try:
                    model = genai.GenerativeModel(model_name)
                except Exception:
                    model_name = "gemini-flash-latest"
                    model = genai.GenerativeModel(model_name)

                prompt = f"""You are SafeSignal AI Safety Assistant, supporting women's physical and digital safety in India.
Ground your response strictly on the retrieved official safety records below. Do not invent laws, procedures, or phone numbers.
If the query describes immediate physical danger, prominently urge calling 112 or 181.

RETRIEVED OFFICIAL CONTEXT:
{"---".join(context_blocks)}

USER QUERY: {query}

INSTRUCTIONS:
1. Provide a direct, calm, reassuring response in clear bullet points.
2. Cite the official sections (IT Act, BNS, or Portal name) where relevant.
3. Explicitly state the relevant helpline number (e.g., 112 for police, 1930 for cybercrime, 181 for women helpline).
4. Include an explicit reminder that you provide guidance, not legal representation or police dispatch."""

                response = model.generate_content(prompt)
                return {
                    "answer": response.text,
                    "sources": sources,
                    "isGrounded": True,
                    "model": f"{model_name} + SafeSignal FAISS Vector RAG",
                    "isDeterministicFallback": False,
                    "disclaimer": "Guidance generated using Google Gemini & grounded in official Indian public sources. Not legal counsel or live emergency dispatch."
                }
            except Exception as e:
                logger.error(f"Gemini generation error: {e}. Falling back to structured synthesis.")

        # 2. Deterministic Grounded Synthesis Fallback
        return self._synthesize_grounded_fallback(query, retrieved, sources)

    def _synthesize_grounded_fallback(self, query: str, retrieved: List[Tuple[Dict[str, Any], float]], sources: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Synthesize a structured, transparent response grounded in retrieved docs without hallucination."""
        if not retrieved or retrieved[0][1] <= 0:
            return {
                "answer": "SafeSignal verified knowledge base does not have high-confidence documentation for this specific query.\n\nFor immediate safety in India:\n- **Physical Emergency**: Dial **112** (Pan-India Emergency Response).\n- **Cybercrime & Blackmail**: Dial **1930** or file a report at **cybercrime.gov.in**.\n- **Women Helpline**: Dial **181** for 24/7 counseling and legal referral.",
                "sources": [
                    {
                        "title": "National Emergency Number 112",
                        "url": "https://112.gov.in",
                        "sourceType": "Official Government",
                        "verifiedDate": "2026-02-15"
                    },
                    {
                        "title": "National Cyber Crime Reporting Portal",
                        "url": "https://cybercrime.gov.in",
                        "sourceType": "Official Government",
                        "verifiedDate": "2026-02-15"
                    }
                ],
                "isGrounded": True,
                "model": "SafeSignal Curated Knowledge Base (RAG Fallback)",
                "isDeterministicFallback": True,
                "disclaimer": "SafeSignal provides informational guidance, not legal counsel or live emergency dispatch."
            }

        top_doc, _ = retrieved[0]
        
        # Build synthesis
        answer_parts = []
        answer_parts.append(f"**Grounded Guidance regarding {top_doc['title']}:**\n")
        answer_parts.append(top_doc['content'])

        if len(retrieved) > 1:
            second_doc, _ = retrieved[1]
            answer_parts.append(f"\n\n**Additional Protocol ({second_doc['title']}):**\n{second_doc['content']}")

        answer_parts.append("\n\n**Key Actions to Take Now:**\n"
                            "1. Preserve unedited digital evidence (screenshots with timestamps and full URLs).\n"
                            "2. Do not pay extortion demands or engage in hostile arguments with the perpetrator.\n"
                            "3. Report immediately on official portals (cybercrime.gov.in) or call **1930** (Cyber) / **112** (Police).")

        return {
            "answer": "".join(answer_parts),
            "sources": sources,
            "isGrounded": True,
            "model": "SafeSignal FAISS Vector Retriever (Deterministic Grounded Synthesis)",
            "isDeterministicFallback": True,
            "disclaimer": "Information retrieved from curated Indian safety authorities. SafeSignal provides informational guidance, not legal counsel or live emergency dispatch."
        }


# Global engine singleton
rag_engine = RAGEngine()
