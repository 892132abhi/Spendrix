from datetime import datetime
from app.database.mongo import chat_collection

def save_message(session_id: str, role: str, content: str):
    """Inserts a single message document into MongoDB."""
    chat_collection.insert_one(
        {
            "session_id": session_id,
            "role": role,
            "content": content,
            "created_at": datetime.utcnow()
        }
    )

def get_chat_history(session_id: str, limit: int = 20):
    """Retrieves chronological dialogue sequences for a specific session."""
    messages = (
        chat_collection
        .find({"session_id": session_id})
        .sort("created_at", 1)
        .limit(limit)
    )
    return list(messages)