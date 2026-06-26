import os
from pymongo import MongoClient

client = MongoClient(
    os.getenv(
        "MONGO_URI",
        "mongodb://mongodb:27017"
    )
)

db = client["spendrix"]

chat_collection = db["workspace_chats"]