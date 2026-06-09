import json
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status

# Absolute app paths mapping perfectly to your Docker PYTHONPATH rules
from app.services.rag_system.chunking import chunk_text
from app.services.rag_system.embedding import embed
from app.services.rag_system.vector_store import create_transient_index, search_dynamic_index
from app.services.rag_system.generator import generate_answer
from app.utils.pdf import extract_text  

router = APIRouter()

@router.post("/upload")
async def handle_upload(file: UploadFile = File(...)):
    try:
        # Pass file.file directly to extract_text out of raw RAM stream!
        raw_text = extract_text(file.file)
        if not raw_text.strip():
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, 
                detail="Could not extract any clean text from this PDF."
            )
        return {"extracted_text": raw_text, "status": "✅ Ready"}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/message")
async def handle_chat(message: str = Form(...), doc_text: str = Form(...)):
    try:
        chunks = chunk_text(doc_text)
        vectors = [embed(c) for c in chunks]
        
        index = create_transient_index(chunks, vectors)
        query_vector = embed(message)
        context = search_dynamic_index(index, query_vector, chunks, k=4)
        
        reply = generate_answer(query=message, context=context, force_json=False)
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/generate-kit")
async def handle_generate_kit(doc_text: str = Form(...), job_description: str = Form(...)):
    try:
        chunks = chunk_text(doc_text)
        vectors = [embed(c) for c in chunks]
        
        index = create_transient_index(chunks, vectors)
        query_vector = embed(job_description)
        context = search_dynamic_index(index, query_vector, chunks, k=5)
        
        prompt_directive = f"""
        Target Job Criteria: {job_description}
        
        Task:
        Review the candidate text context and write exactly 3 high-impact technical interview questions.
        Return your response strictly as a structured JSON object matching this exact schema:
        {{
            "questions": [
                {{
                    "question_text": "The custom targeted question",
                    "target_skill": "The primary skill being verified",
                    "intent": "Why ask this based on their profile facts vs the job rules",
                    "grading_rubric": {{
                        "ideal": "What an elite expert response contains",
                        "acceptable": "What a basic pass response contains",
                        "red_flag": "Answer indicators showing lack of real knowledge"
                    }}
                }}
            ]
        }}
        """
        
        json_response_string = generate_answer(query=prompt_directive, context=context, force_json=True)
        return {"kit": json.loads(json_response_string)}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))