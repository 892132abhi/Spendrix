from app.services.rag_system.embedding import embed
from app.services.rag_system.vector_store import search_qdrant  

def retrieve(query: str, filename: str, k=5):
    """
    Converts user prompt to vector coordinate array and extracts matching contexts
    filtered specifically to the active file name.
    """
    # 1. Convert user's question into a 768-dim Gemini vector
    query_vector = embed(query, task_type="RETRIEVAL_QUERY")

    # 2. Query Qdrant with both vector coordinates and payload source key filters
    results = search_qdrant(query_vector, file_name=filename, k=k)

    return results