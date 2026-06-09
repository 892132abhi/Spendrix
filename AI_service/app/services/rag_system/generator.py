import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY is missing")

genai.configure(api_key=GEMINI_API_KEY)

model = genai.GenerativeModel(
    "gemini-2.5-flash",
    generation_config={
        "temperature": 0.2,
        "top_p": 1,
        "top_k": 1,
    },
)


def generate_answer(query, context, force_json=False):
    output_rule = ""

    if force_json:
        output_rule = "Return ONLY valid JSON. Do not include markdown or explanation."

    prompt = f"""
You are an advanced recruitment AI assistant.

Context extracted from the uploaded document:
{context}

User question or task:
{query}

{output_rule}
"""

    response = model.generate_content(prompt)

    result = response.text.strip()

    if force_json:
        result = result.replace("```json", "").replace("```", "").strip()
        json.loads(result)

    return result