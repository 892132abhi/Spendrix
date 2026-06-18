from app.services.rag_system.embedding import embed
from app.services.rag_system.vector_store import search_qdrant  

def retrieve(query: str, filename: str, k: int = 5):
    """Transforms standard user strings into queries and gathers target text frames."""
    query_vector = embed(query, task_type="RETRIEVAL_QUERY")
    results = search_qdrant(query_vector, file_name=filename, k=k)
    return results