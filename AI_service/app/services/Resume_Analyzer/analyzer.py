import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
model = genai.GenerativeModel("gemini-2.5-flash")

def analyze_resume(resume_text):
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
        result = result.replace("```json", "")
        result = result.replace("```", "")
        result = result.strip()
        try:

            return json.loads(result)
        except json.JSONDecodeError:
              return{
                    "score":0,
                    "strengths":[],
                    "weaknesses":["AI returned invalid JSON"],
                    "suggessions":["Try uploading again or improve the prompt formatting."]
              }