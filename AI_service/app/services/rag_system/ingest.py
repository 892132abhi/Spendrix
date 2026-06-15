# process.py
import os
from utils.pdf import extract_text
from .chunking import chunk_text
from .embedding import embed
from .vector_store import store_in_qdrant

def process_file(file_path):
    """Extracts, embeds, and indexes a local PDF document into the vector space."""
    text = extract_text(file_path)
    
    chunks = chunk_text(text)
    
    # Generate Gemini vector embeddings sequentially for each string block
    vectors = [embed(c) for c in chunks]

    # Permanently store chunks inside your local running Qdrant instance
    store_in_qdrant(vectors, chunks, file_name=os.path.basename(file_path))

    return {
        "status": "indexed",
        "chunks": len(chunks)
    }