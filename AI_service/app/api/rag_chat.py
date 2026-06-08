import json
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status

# Import directly from your clean local service modules
from app.services.rag_systen.chunking import chunk_text
from app.services.rag_systen.embedding import embed
from app.services.rag_systen.vector_store import create_transient_index, search_dynamic_index
from app.services.rag_systen.generator import generate_answer
from utils.pdf import extract_text  # Uses your existing PDF extractor utility

router = APIRouter()

# 1. HANDLE USER FILE UPLOADS & TEXT EXTRACTION
@router.post("/upload")
async def handle_upload(file: UploadFile = File(...)):
    try:
        # Temporarily save the file stream onto disk to let your script parse paths
        temp_path = f"/tmp/{file.filename}"
        with open(temp_path, "wb") as buffer:
            buffer.write(await file.read())
            
        # Extract text using your existing utils code
        raw_text = extract_text(temp_path)
        return {"extracted_text": raw_text, "status": "✅ Ready"}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# 2. INTERACTIVE USER CONVERSATION CHAT (RAG OVER THE TEXT)
@router.post("/message")
async def handle_chat(message: str = Form(...), doc_text: str = Form(...)):
    try:
        # Process chunks and embeddings on the fly
        chunks = chunk_text(doc_text)
        vectors = [embed(c) for c in chunks]
        
        # Search transient index cleanly without global state cross-contamination
        index = create_transient_index(chunks, vectors)
        query_vector = embed(message)
        context = search_dynamic_index(index, query_vector, chunks, k=4)
        
        # Generate the conversational response reply
        reply = generate_answer(query=message, context=context, force_json=False)
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# 3. COMPILE FORMAL STRUCTURED INTERVIEW QUESTIONS KIT
@router.post("/generate-kit")
async def handle_generate_kit(doc_text: str = Form(...), job_description: str = Form("Technical Developer Role")):
    try:
        chunks = chunk_text(doc_text)
        vectors = [embed(c) for c in chunks]
        
        # Find candidate text regions matching the job specifications
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
        
        # Force direct compliance output mapping
        json_response_string = generate_answer(query=prompt_directive, context=context, force_json=True)
        return {"kit": json.loads(json_response_string)}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))