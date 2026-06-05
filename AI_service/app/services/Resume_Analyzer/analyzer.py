import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

from app.utils.cache import get_cached_result, set_cached_result

load_dotenv()

genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

model = genai.GenerativeModel(
    "gemini-2.5-flash",
    generation_config={
        "temperature": 0,
        "top_p": 1,
        "top_k": 1
    }
)

def analyze_resume(resume_text):

    # 🔥 1. CHECK CACHE FIRST
    cached = get_cached_result(resume_text)
    if cached:
        return cached

    prompt = f"""
Analyze this resume and return ONLY valid JSON.

{{
    "score": 0,
    "strengths": [],
    "weaknesses": [],
    "suggestions": []
}}

Evaluate:
- Skills
- Projects
- Experience
- Education
- Resume Structure

Resume:

{resume_text}
"""

    response = model.generate_content(prompt)

    result = response.text
    result = result.replace("```json", "").replace("```", "").strip()

    try:
        parsed = json.loads(result)

        # 🔥 2. SAVE TO CACHE
        set_cached_result(resume_text, parsed)

        return parsed

    except json.JSONDecodeError:
        return {
            "score": 0,
            "strengths": [],
            "weaknesses": ["AI returned invalid JSON"],
            "suggestions": ["Try uploading again or improve the prompt formatting."]
        }