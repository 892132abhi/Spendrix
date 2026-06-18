import os
from pymongo import MongoClient

MONGO_URI = os.getenv("MONGO_URI", "mongodb://mongodb:27017")

client = MongoClient(MONGO_URI)
db = client["spendrix"]
chat_collection = db["workspace_chats"]