from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.resume_analyzer import router as resume_router
from app.api.job_recommender import router as job_router
from app.api.interview_schedule import router as interview_router
from app.api.rag_chat import router as rag_router
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    resume_router,
    prefix="/resume",
    tags=["Resume Analyzer"]
)
app.include_router(
    job_router,
    prefix="/jobs",
    tags=["Job Recommender"]
)
app.include_router(
    interview_router,
    prefix="/interview",
    tags=["Interview Scheduler"]
)
app.include_router(
    rag_router,
    prefix="/workspace",
    tags=["AI RAG workspace"]
)
@app.get("/")
def home():
    return {"message": "AI Service Running"}