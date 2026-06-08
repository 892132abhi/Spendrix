from fastapi import APIRouter, UploadFile, File, Form
import json
from app.utils.pdf import extract_text
from app.services.Resume_Analyzer.analyzer import analyze_resume

# 🎯 FIXED: Changed path from .matcher to .interview_matcher to match your actual file name!
from app.services.interview_scheduler.interview_matcher import match_best_interviewer

router = APIRouter()

@router.post("/auto-schedule")
async def auto_schedule_interviews_api(
    job_title: str = Form(...),
    job_skills: str = Form(...),
    job_description: str = Form(...),
    interviewers: str = Form(...), 
    resume: UploadFile = File(...)
):
    # Read bytes from uploaded file stream and extract text
    resume_text = extract_text(resume.file)
    
    if not resume_text:
        return {"is_match": False, "status": "Could not read text from PDF resume."}

    # Evaluate using your general analyzer function
    analysis = analyze_resume(resume_text=resume_text)

    # Shortlist if the score returned by your analyzer is >= 70
    score = analysis.get("score", 0)
    is_match = score >= 50

    if is_match:
        parsed_interviewers = json.loads(interviewers)
        matching_result = match_best_interviewer(
            job_title=job_title,
            job_skills=job_skills,
            candidate_strengths=analysis.get("strengths", []), 
            interviewers_list=parsed_interviewers
        )

        # Build a neat string out of your AI's custom parsed strengths array
        strengths_str = ", ".join(analysis.get("strengths", []))
        if not matching_result.get("is_match"):
             return {
                  "is_match": True,
                  "score": score,
                   "reason": matching_result.get(
                       "reason",
                       "No suitable interviewer found"
                       )
             }

        return {
            "is_match": True,
            "score":score,
            "assigned_interviewer_id": matching_result.get("interviewer_id"),
            "reason": f"AI Base Score: {score}/100. Key Strengths: {strengths_str}. | Interviewer Choice: {matching_result.get('reason')}"
        }

    return {"is_match": False, "score": score, "status": f"Candidate score ({score}) did not meet the requirement threshold."}