import hashlib

cache = {}

def normalize_text(text: str) -> str:
    return " ".join(text.split())

def get_resume_hash(text: str) -> str:
    normalized = normalize_text(text)
    return hashlib.sha256(normalized.encode()).hexdigest()

def get_cached_result(text: str):
    key = get_resume_hash(text)
    return cache.get(key)

def set_cached_result(text: str, value):
    key = get_resume_hash(text)
    cache[key] = value