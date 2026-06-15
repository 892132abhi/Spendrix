import os
import uuid
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct, Filter, FieldCondition, MatchValue

qdrant_client = QdrantClient(
    host=os.getenv("QDRANT_HOST", "localhost"), 
    port=int(os.getenv("QDRANT_PORT", 6333))
)

COLLECTION_NAME = "recruitment_documents"
VECTOR_SIZE = 768  # Matches gemini-embedding-001 dimension

def init_qdrant():
    """Ensures the recruitment collection exists in Qdrant."""
    if not qdrant_client.collection_exists(COLLECTION_NAME):
        qdrant_client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE),
        )

def store_in_qdrant(vectors, chunks, file_name: str):
    """Stores chunks paired with a file_name tracking metadata tag."""
    init_qdrant()
    
    points = []
    for vector, chunk in zip(vectors, chunks):
        # Generate a stable, unique deterministic UUID based on chunk text string
        point_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, chunk))
        
        points.append(
            PointStruct(
                id=point_id,
                vector=vector,
                payload={
                    "text": chunk,
                    "source": file_name  
                }
            )
        )
    qdrant_client.upsert(collection_name=COLLECTION_NAME, points=points)

def search_qdrant(query_vector, file_name: str, k=5):
    """Searches vectors scoped strictly to the provided document tracking string."""
    search_results = qdrant_client.search(
        collection_name=COLLECTION_NAME,
        query_vector=query_vector,
        query_filter=Filter(
            must=[FieldCondition(key="source", match=MatchValue(value=file_name))]
        ),
        limit=k
    )
    # Returns a list of strings instead of a pre-joined giant text block 
    # to maintain compatibility with standard RAG retrieval configurations
    return [result.payload["text"] for result in search_results]