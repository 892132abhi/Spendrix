from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

from app.services.job_recommender.job_recommends import recommend_jobs

router = APIRouter()


class JobItem(BaseModel):
    id: int
    title: str
    company: Optional[str] = ""
    skills: str
    description: str
    location: Optional[str] = ""
    experience: Optional[int] = 0
    job_type: Optional[str] = ""
    job_mode: Optional[str] = ""


class JobRecommendRequest(BaseModel):
    resume_text: str
    candidate_skills: Optional[str] = ""
    jobs: List[JobItem]


@router.post("/recommend")
def recommend_jobs_api(data: JobRecommendRequest):
    recommendations = recommend_jobs(
        resume_text=data.resume_text,
        candidate_skills=data.candidate_skills,
        jobs=[job.model_dump() for job in data.jobs],
    )

    return {
        "recommendations": recommendations
    }