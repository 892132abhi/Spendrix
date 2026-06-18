import os
import uuid
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct, Filter, FieldCondition, MatchValue

qdrant_client = QdrantClient(
    host=os.getenv("QDRANT_HOST", "qdrant"), 
    port=int(os.getenv("QDRANT_PORT", 6333))
)

COLLECTION_NAME = "recruitment_documents"
VECTOR_SIZE = 768  # Set to 768 to match gemini-embedding-001 dimensional outputs

def init_qdrant():
    """Ensures the recruitment collection target space exists inside Qdrant."""
    if not qdrant_client.collection_exists(COLLECTION_NAME):
        qdrant_client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE),
        )

def store_in_qdrant(vectors, chunks, file_name: str):
    """Upserts embedded vector payload metrics grouped by metadata filters."""
    init_qdrant()
    points = []
    
    for vector, chunk in zip(vectors, chunks):
        point_id = str(uuid.uuid4())
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

def search_qdrant(query_vector, file_name: str, k: int = 5):
    """Executes vector searches filtered tightly by the file's metadata source key."""
    search_results = qdrant_client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_vector,
        query_filter=Filter(
            must=[
                FieldCondition(
                    key="source",
                    match=MatchValue(value=file_name)
                )
            ]
        ),
        limit=k,
        with_payload=True
    )
    
    for point in search_results.points:
        print(f"SOURCE MATCHED: {point.payload.get('source')} | SCORE: {point.score}")

    return [point.payload["text"] for point in search_results.points]