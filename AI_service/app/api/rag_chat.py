import json
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status

from app.services.rag_system.chunking import chunk_text
from app.services.rag_system.embedding import embed
from app.services.rag_system.vector_store import store_in_qdrant
from app.services.rag_system.retriever import retrieve
from app.services.rag_system.generator import generate_answer
from app.services.rag_system.chat_store import save_message, get_chat_history
from app.utils.pdf import extract_text

router = APIRouter()

@router.get("/history/{session_id}")
async def handle_get_history(session_id: str):
    """
    Fetches past chat history from MongoDB and extracts the tracked 
    filename metadata to fully restore the active workspace layout state.
    """
    try:
        history = get_chat_history(session_id)
        formatted_messages = []
        recovered_filename = ""
        
        for msg in history:
            role_map = "USER" if msg["role"] == "user" else "AI"
            formatted_messages.append({
                "sender": role_map,
                "text": msg["content"]
            })
            
            # Detect and extract the active filename from the original upload System Notice
            if msg["role"] == "assistant" and "System Notice: Successfully processed" in msg["content"]:
                try:
                    # Extracts filename string between 'processed ' and the trailing period notice block
                    parts = msg["content"].split("processed ")
                    if len(parts) > 1:
                        recovered_filename = parts[1].split(".\n\n")[0].strip()
                except Exception:
                    pass
            
        return {
            "messages": formatted_messages,
            "filename": recovered_filename,  # Returned back to Django -> React
            "status": "Success"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch conversation sequence: {str(e)}"
        )


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

        chunks = chunk_text(raw_text)
        if chunks:
            vectors = [embed(chunk, task_type="RETRIEVAL_DOCUMENT") for chunk in chunks]
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
async def handle_chat(
    session_id: str = Form(...),
    message: str = Form(...),
    filename: str = Form(...)
):
    try:
        save_message(session_id=session_id, role="user", content=message)

        matched_chunks = retrieve(query=message, filename=filename, k=4)
        if not matched_chunks:
            raise HTTPException(status_code=404, detail="No context found.")

        context = "\n\n".join(matched_chunks)

        history = get_chat_history(session_id)
        history_text = ""
        for msg in history:
            history_text += f"{msg['role']}: {msg['content']}\n"

        reply = generate_answer(query=message, context=context, chat_history=history_text)

        save_message(session_id=session_id, role="assistant", content=reply)

        return {"reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-kit")
async def handle_generate_kit(filename: str = Form(...), job_description: str = Form(...)):
    try:
        matched_chunks = retrieve(query=job_description, filename=filename, k=5)
        if not matched_chunks:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No matching context found to build this kit."
            )

        context = "\n\n".join(matched_chunks)
        prompt_directive = f"Target Criteria:\n{job_description}\nExtract and compile 3 interview questions as JSON."

        json_response_string = generate_answer(query=prompt_directive, context=context, force_json=True)
        return {"kit": json.loads(json_response_string)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))