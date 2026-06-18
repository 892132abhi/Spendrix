import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Use system_instruction to force Gemini to follow strict behavior rules
model = genai.GenerativeModel(
    "gemini-2.5-flash",
    generation_config={
        "temperature": 0.2,
        "top_p": 1,
        "top_k": 1,
    },
    system_instruction=(
        "You are an advanced recruitment AI assistant.\n"
        "Use BOTH the provided Conversation History and Document Context to formulate responses.\n"
        "Rules:\n"
        "- Highly prefer matching data found inside the Document Context block.\n"
        "- Refer to Conversation History when the user asks follow-up questions about previous terms.\n"
        "- Do not invent outside facts or extrapolate fields beyond your data context parameters.\n"
        "- If information cannot be extracted from the material, say exactly:\n"
        "\"I could not find that information in the uploaded document.\""
    )
)

def generate_answer(query: str, context: str, chat_history: str = "", force_json: bool = False):
    """Queries Gemini combining vector space documents alongside MongoDB memory parameters."""
    output_rule = ""
    if force_json:
        output_rule = "Return ONLY valid raw JSON. Do not include markdown structural accents like triple backticks."

    prompt = f"""
{output_rule}

--------------------------------------------------
Conversation History:
{chat_history}

--------------------------------------------------
Document Context:
{context}

--------------------------------------------------
Current User Question:
{query}

--------------------------------------------------
Answer:
"""

    try:
        response = model.generate_content(prompt)
        result = response.text.strip()

        if force_json:
            result = result.replace("```json", "").replace("```", "").strip()
            json.loads(result)  # Validate json integrity

        return result
    except Exception as e:
        print(f"Gemini generation failure tracking error log: {str(e)}")
        raise Exception(f"Gemini generation failed: {str(e)}")