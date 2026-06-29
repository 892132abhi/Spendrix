import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)

model = genai.GenerativeModel(
    "gemini-2.0-flash",
    generation_config={
        "temperature": 0,
        "top_p": 1,
        "top_k": 1,
    }
)


def match_best_interviewer(
    job_title,
    job_skills,
    candidate_strengths,
    interviewers_list
):
    """
    Returns:

    {
        "interviewer_id": 5,
        "reason": "...",
        "is_match": True
    }

    OR

    {
        "interviewer_id": None,
        "reason": "No suitable interviewer found",
        "is_match": False
    }
    """

    if not interviewers_list:
        return {
            "interviewer_id": None,
            "reason": "No interviewers available.",
            "is_match": False
        }

    prompt = f"""
You are an HR operations optimizer.

Your task is to select the BEST interviewer.

Return ONLY valid JSON.

Valid response format:

{{
    "interviewer_id": 1,
    "reason": "Short explanation",
    "is_match": true
}}

OR

{{
    "interviewer_id": null,
    "reason": "No suitable interviewer found",
    "is_match": false
}}

Job Title:
{job_title}

Required Skills:
{job_skills}

Candidate Strengths:
{candidate_strengths}

Available Interviewers:
{json.dumps(interviewers_list, indent=2)}

Rules:

1. Choose interviewer with strongest skill overlap.
2. Prefer interviewer whose expertise matches candidate strengths.
3. Consider job requirements.
4. If no interviewer has reasonable skill overlap, return:

{{
    "interviewer_id": null,
    "reason": "No suitable interviewer found",
    "is_match": false
}}

5. Never randomly assign an interviewer.
6. Return ONLY JSON.
"""

    try:

        response = model.generate_content(prompt)

        result = (
            response.text
            .replace("```json", "")
            .replace("```", "")
            .strip()
        )

        parsed = json.loads(result)

        return {
            "interviewer_id": parsed.get(
                "interviewer_id"
            ),
            "reason": parsed.get(
                "reason",
                ""
            ),
            "is_match": parsed.get(
                "is_match",
                False
            )
        }

    except Exception as e:

        print(
            f"Interviewer Matching Error: {e}"
        )

        return {
            "interviewer_id": None,
            "reason": (
                "AI could not determine a "
                "suitable interviewer."
            ),
            "is_match": False
        }