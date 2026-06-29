from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import google.generativeai as genai
import os
import json

router = APIRouter()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))


class JDRequest(BaseModel):
    title: str
    job_type: str
    experience: int
    Qualification: str | None = None
    skills: str          
    location: str | None = None
    company_name: str | None = None


class JDResponse(BaseModel):
    description: str


@router.post("/generate", response_model=JDResponse)
async def generate_jd(payload: JDRequest):
    prompt = f"""
You are an expert HR copywriter. Write a professional, engaging job description.

Job Title: {payload.title}
Job Type: {payload.job_type}
Experience Required: {payload.experience} years
Qualification: {payload.Qualification or "Not specified"}
Required Skills: {payload.skills}
Location: {payload.location or "Not specified"}
Company: {payload.company_name or "Not specified"}

Write it as plain text (no markdown headers, no asterisks) with this structure:
1. A short 2-3 sentence overview of the role.
2. "Responsibilities:" followed by 4-6 bullet points using "- " prefix.
3. "Requirements:" followed by 4-6 bullet points using "- " prefix.

Keep it concise, professional, and ready to publish as-is.
"""

    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content(prompt)
        text = response.text.strip()
        return JDResponse(description=text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"JD generation failed: {str(e)}")