from fastapi import File, UploadFile,APIRouter
from app.utils.pdf import extract_text
from app.services.Resume_Analyzer.analyzer import analyze_resume 

router = APIRouter()

@router.get("/")
def home():
    return {"message": "AI Resume Analyzer"}

@router.post("/analyze_resume")
async def analyze_resume_api(file: UploadFile = File(...)):

    resume_text = extract_text(file.file)

    result = analyze_resume(resume_text)

    return result