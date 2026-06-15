import json
import os
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status

from app.services.rag_system.chunking import chunk_text
from app.services.rag_system.embedding import embed
from app.services.rag_system.vector_store import store_in_qdrant
from app.services.rag_system.retriever import retrieve
from app.services.rag_system.generator import generate_answer
from app.utils.pdf import extract_text

router = APIRouter()

@router.post("/upload")
async def handle_upload(file: UploadFile = File(...)):
    try:
        if not file.filename.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only PDF files are supported."
            )

        # Ensure text extractor handles the uploaded SpooledTemporaryFile cleanly
        raw_text = extract_text(file.file)

        if not raw_text:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Could not extract any readable text from this PDF."
            )

        chunks = chunk_text(raw_text)
        if chunks:
            vectors = [embed(chunk, task_type="RETRIEVAL_DOCUMENT") for chunk in chunks]
            # Save blocks directly into persistent Qdrant using filename as tracking string
            store_in_qdrant(vectors, chunks, file_name=file.filename)

        return {"filename": file.filename, "status": "Ready and Indexed"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"PDF upload failed: {str(e)}"
        )


@router.post("/message")
async def handle_chat(message: str = Form(...), filename: str = Form(...)):
    try:
        # Use our clean updated retrieval service layer to capture context array
        matched_chunks = retrieve(query=message, filename=filename, k=4)

        if not matched_chunks:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No context matching this document found in the database store."
            )

        context = "\n\n".join(matched_chunks)

        reply = generate_answer(
            query=message,
            context=context,
            force_json=False
        )

        return {"reply": reply}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chat failed: {str(e)}"
        )


@router.post("/generate-kit")
async def handle_generate_kit(filename: str = Form(...), job_description: str = Form(...)):
    try:
        # Pull down context chunks scoped by document filename using description as search vector
        matched_chunks = retrieve(query=job_description, filename=filename, k=5)

        if not matched_chunks:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No relevant matching text blocks found to process this interview kit."
            )

        context = "\n\n".join(matched_chunks)

        prompt_directive = f"""
Target Job Criteria:
{job_description}

Task:
Review the candidate text context and write exactly 3 high-impact technical interview questions.

Return this JSON format:
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

        json_response_string = generate_answer(
            query=prompt_directive,
            context=context,
            force_json=True
        )

        return {"kit": json.loads(json_response_string)}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Kit generation failed: {str(e)}"
        )