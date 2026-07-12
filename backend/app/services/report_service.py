import json

from app.services.gemini_service import model


def generate_cognitive_report(

    memory_score,
    language_score,
    reasoning_score,
    chi

):

    prompt = f"""
You are an expert cognitive assessment assistant.

Patient Scores:

Memory: {memory_score}

Language: {language_score}

Reasoning: {reasoning_score}

Cognitive Health Index: {chi}

Generate a detailed cognitive report.

Return ONLY JSON.

Format:

{{
    "memory_analysis":"...",
    "language_analysis":"...",
    "reasoning_analysis":"...",
    "strengths":"...",
    "weaknesses":"...",
    "suggested_exercises":"..."
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