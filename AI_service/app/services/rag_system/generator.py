import os
import json
from openai import OpenAI

# Pull the API Key directly from your system environment secrets
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_answer(query, context, force_json=False):
    system_prompt = "You are an advanced recruitment AI assistant."
    
    if force_json:
        system_prompt += " You must structure your entire output as a valid JSON object matching the requested schema."

    prompt = f"""
    Context extracted from documents:
    {context}

    User Input Task:
    {query}
    """

    args = {
        "model": "gpt-4o-mini", # Cost-efficient and fast
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.2
    }

    if force_json:
        args["response_format"] = {"type": "json_object"}

    response = client.chat.completions.create(**args)
    return response.choices[0].message.content