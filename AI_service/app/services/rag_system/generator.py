import os
from openai import OpenAI

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY is missing")

client = OpenAI(api_key=OPENAI_API_KEY)


def generate_answer(query, context, force_json=False):

    system_prompt = "You are an advanced recruitment AI assistant."

    if force_json:
        system_prompt += (
            " You must structure your output as valid JSON."
        )

    prompt = f"""
    Context extracted from documents:
    {context}

    User Input Task:
    {query}
    """

    args = {
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.2,
    }

    if force_json:
        args["response_format"] = {"type": "json_object"}

    response = client.chat.completions.create(**args)

    return response.choices[0].message.content