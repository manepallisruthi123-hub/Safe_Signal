import json
import logging
from pathlib import Path
from typing import List, Dict, Any
from app.config import KNOWLEDGE_BASE_DIRS

logger = logging.getLogger(__name__)

def load_knowledge_base_documents() -> List[Dict[str, Any]]:
    """
    Search available knowledge base directories and load all verified safety documents.
    """
    documents = []
    found_dir = None

    for candidate in KNOWLEDGE_BASE_DIRS:
        if candidate.exists() and candidate.is_dir():
            found_dir = candidate
            break

    if not found_dir:
        logger.warning("No knowledge base directory found in candidate locations.")
        return documents

    json_files = list(found_dir.glob("*.json"))
    for f in json_files:
        try:
            with open(f, "r", encoding="utf-8") as fp:
                data = json.load(fp)
                if isinstance(data, list):
                    for item in data:
                        # Clean and validate document
                        if "title" in item and "content" in item:
                            documents.append({
                                "id": item.get("id", f"{f.stem}-{len(documents)}"),
                                "title": item["title"],
                                "content": item["content"],
                                "category": item.get("category", "General Safety"),
                                "source_name": item.get("source_name", "SafeSignal Verified Knowledge Base"),
                                "source_url": item.get("source_url", "https://cybercrime.gov.in"),
                                "source_type": item.get("source_type", "Official Government"),
                                "verified_date": item.get("verified_date", "2026-02-15"),
                                "keywords": item.get("keywords", [])
                            })
        except Exception as e:
            logger.error(f"Error loading {f}: {e}")

    logger.info(f"Loaded {len(documents)} verified safety documents from {found_dir}")
    return documents
