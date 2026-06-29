import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel(
    "gemini-2.0-flash",
    generation_config={
        "temperature": 0,
        "top_p": 1,
        "top_k": 1,
    }
)


def recommend_jobs(resume_text, candidate_skills, jobs):
    prompt = f"""
You are a job recommendation engine.

Compare the candidate resume and skills with the provided job list.
Return ONLY valid JSON. No markdown.

Return this format:

[
  {{
    "job_id": 1,
    "score": 85,
    "reason": "Short reason why this job matches",
    "matching_skills": ["Python", "Django"],
    "missing_skills": ["Docker"]
  }}
]

Rules:
- Recommend only suitable jobs.
- Score must be 0 to 100.
- Return top 5 jobs only.
- If no jobs match, return [].

Candidate skills:
{candidate_skills}

Resume text:
{resume_text}

Jobs:
{json.dumps(jobs, indent=2)}
"""

    response = model.generate_content(prompt)

    result = response.text
    result = result.replace("```json", "").replace("```", "").strip()

    try:
        return json.loads(result)
    except json.JSONDecodeError:
        return []