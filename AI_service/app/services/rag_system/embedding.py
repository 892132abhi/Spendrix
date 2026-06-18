import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY is missing")

genai.configure(api_key=GEMINI_API_KEY)
EMBEDDING_MODEL = "models/gemini-embedding-001"

def embed(text: str, task_type: str = "RETRIEVAL_DOCUMENT"):
    """Generates an vector coordinate array mapping text elements."""
    response = genai.embed_content(
        model=EMBEDDING_MODEL,
        content=text,
        task_type=task_type,
    )
    return response["embedding"]