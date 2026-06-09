import os
import json
import hashlib
import redis

REDIS_URL = os.getenv(
    "REDIS_URL",
    "redis://redis:6379/1"
)

redis_client = redis.Redis.from_url(
    REDIS_URL,
    decode_responses=True
)


def normalize_text(text: str) -> str:
    return " ".join(text.split())


def get_resume_hash(text: str) -> str:
    normalized = normalize_text(text)

    return hashlib.sha256(
        normalized.encode("utf-8")
    ).hexdigest()


def get_cached_result(text: str):
    key = get_resume_hash(text)

    try:
        data = redis_client.get(key)

        if data:
            return json.loads(data)

        return None

    except Exception as e:
        print(f"Redis GET Error: {e}")
        return None


def set_cached_result(
    text: str,
    value,
    ttl=86400
):
    key = get_resume_hash(text)

    try:
        redis_client.set(
            key,
            json.dumps(value),
            ex=ttl
        )

    except Exception as e:
        print(f"Redis SET Error: {e}")