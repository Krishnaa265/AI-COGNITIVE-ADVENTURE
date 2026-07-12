from app.services.gemini_service import model
import json


def evaluate_fluency_ai(
    category,
    transcript
):

    prompt = f"""
You are evaluating a verbal fluency test.

Category:
{category}

User Response:
{transcript}

Return ONLY JSON.

Format:

{{
    "score":80,
    "valid_words":[
        "apple",
        "banana"
    ],
    "invalid_words":[
        "car"
    ]
}}
"""

    response = model.generate_content(
        prompt
    )

    text = (
        response.text
        .replace("```json", "")
        .replace("```", "")
        .strip()
    )

    return json.loads(text)