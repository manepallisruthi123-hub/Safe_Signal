from fastapi import APIRouter
from app.models.schemas import ResourcesResponse, ResourceItem
from app.rag.engine import rag_engine

router = APIRouter(prefix="/api", tags=["Resources"])

@router.get("/resources", response_model=ResourcesResponse)
def get_resources():
    items = []
    seen_urls = set()

    for doc in rag_engine.documents:
        url = doc.get("source_url")
        if url and url not in seen_urls:
            seen_urls.add(url)
            items.append(ResourceItem(
                title=doc.get("title", ""),
                category=doc.get("category", "Official Resource"),
                url=url,
                description=doc.get("content", "")[:180] + "...",
                source=doc.get("source_name", "SafeSignal Verified Knowledge Base"),
                verifiedDate=doc.get("verified_date", "2026-02-15")
            ))

    return ResourcesResponse(resources=items, isFallback=False)
