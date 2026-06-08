import numpy as np
from .vector_store import index, chunks_store
from .embedding import embed

def retrieve(query, k=5):
    query_vector = embed(query)

    _, indices = index.search(
        np.array([query_vector]).astype("float32"), k
    )

    results = []

    for i in indices[0]:
        if i < len(chunks_store):
            results.append(chunks_store[i])

    return results