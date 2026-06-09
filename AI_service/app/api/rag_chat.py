import json
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status

from app.services.rag_system.chunking import chunk_text
from app.services.rag_system.embedding import embed
from app.services.rag_system.vector_store import create_transient_index, search_dynamic_index
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

        raw_text = extract_text(file.file)

        if not raw_text:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Could not extract any readable text from this PDF."
            )

        return {
            "extracted_text": raw_text,
            "status": "Ready"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"PDF upload failed: {str(e)}"
        )


@router.post("/message")
async def handle_chat(message: str = Form(...), doc_text: str = Form(...)):
    try:
        chunks = chunk_text(doc_text)

        if not chunks:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="No usable document chunks found."
            )

        vectors = [
            embed(chunk, task_type="retrieval_document")
            for chunk in chunks
        ]

        index = create_transient_index(chunks, vectors)

        query_vector = embed(
            message,
            task_type="retrieval_query"
        )

        context = search_dynamic_index(index, query_vector, chunks, k=4)

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
async def handle_generate_kit(
    doc_text: str = Form(...),
    job_description: str = Form(...)
):
    try:
        chunks = chunk_text(doc_text)

        if not chunks:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="No usable document chunks found."
            )

        vectors = [
            embed(chunk, task_type="RETRIEVAL_DOCUMENT")
            for chunk in chunks
        ]

        index = create_transient_index(chunks, vectors)

        query_vector = embed(
            job_description,
            task_type="RETRIEVAL_QUERY"
        )

        context = search_dynamic_index(index, query_vector, chunks, k=5)

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