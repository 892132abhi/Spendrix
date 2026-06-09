from utils.pdf import extract_text
from .chunking import chunk_text
from .embedding import embed
from .vector_store import store

def process_file(file_path):
    text = extract_text(file_path)

    chunks = chunk_text(text)

    vectors = [embed(c) for c in chunks]

    store(vectors, chunks)

    return {
        "status": "indexed",
        "chunks": len(chunks)
    }