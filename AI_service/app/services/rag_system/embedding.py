import os
from google import genai
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY is missing")

client = genai.Client(api_key=GEMINI_API_KEY)

EMBEDDING_MODEL = "models/gemini-embedding-001"

def embed(text: str, task_type: str = "RETRIEVAL_DOCUMENT"):
    """Generates an vector coordinate array mapping text elements."""
    response = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=text,
        config={"task_type": task_type, "output_dimensionality": 768},
    )
    return response.embeddings[0].values