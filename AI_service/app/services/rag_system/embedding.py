from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

def embed(text):
    # Returns raw numpy arrays directly—much faster for FAISS matrix math
    return model.encode(text)