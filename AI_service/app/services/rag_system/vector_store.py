import faiss
import numpy as np

def create_transient_index(chunks, vectors):
    dimension = 384
    index = faiss.IndexFlatL2(dimension)
    
    # Cast vectors safely to float32 numpy array
    index.add(np.array(vectors).astype("float32"))
    return index

def search_dynamic_index(index, query_vector, chunks, k=4):
    actual_k = min(k, len(chunks))
    distances, indices = index.search(np.array([query_vector]).astype("float32"), actual_k)
    
    results = []
    for i in indices[0]:
        if i != -1 and i < len(chunks):
            results.append(chunks[i])
            
    return "\n".join(results)