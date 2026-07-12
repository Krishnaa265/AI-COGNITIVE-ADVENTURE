import json
import os
from google import genai
from google.genai import types
from dotenv import load_dotenv
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

client = genai.Client(api_key=GEMINI_API_KEY)
MODEL  = "gemini-2.5-flash"


def _generate(prompt: str) -> str:
    """Single helper — all Gemini calls go through here."""
    response = client.models.generate_content(
        model    = MODEL,
        contents = prompt,
    )
    return (
        response.text
        .replace("```json", "")
        .replace("```", "")
        .strip()
    )


def generate_detective_mission() -> dict:
    prompt = """Create a short mystery story between 80 and 120 words set in everyday Indian life.
Make it simple and clear — it will be read aloud to elderly patients in rehabilitation.

Generate exactly four questions testing different cognitive domains.

Return ONLY valid JSON, no markdown:

{
    "story": "...",
    "questions": [
        {"type": "memory",    "question": "What object did the person carry?"},
        {"type": "attention", "question": "What colour was the door?"},
        {"type": "sequence",  "question": "What did she do before leaving?"},
        {"type": "reasoning", "question": "Why do you think she went there?"}
    ]
}"""
    return json.loads(_generate(prompt))


def evaluate_detective_mission(story: str, questions: list, answers: list) -> dict:
    q_text = "\n".join(
        f"Q{i+1} ({q.get('type','') if isinstance(q,dict) else 'general'}): "
        f"{q.get('question',q) if isinstance(q,dict) else q} — Answer: {a}"
        for i, (q, a) in enumerate(zip(questions, answers))
    )
    prompt = f"""You are evaluating a cognitive assessment for elderly rehabilitation patients.
Be encouraging and fair. Short answers that capture the key idea should score well.

Story told to patient:
{story}

Patient responses:
{q_text}

Score each domain 0-100.
- memory: recalled specific facts?
- attention: noticed details?
- reasoning: logical conclusion?
- language: coherent expression?
- overall: weighted average

Return ONLY valid JSON, no markdown:
{{"memory":70,"attention":65,"reasoning":60,"language":75,"overall":68}}"""
    return json.loads(_generate(prompt))


def generate_cognitive_report(memory: float, language: float, reasoning: float, chi: float) -> dict:
    prompt = f"""You are a clinical neuropsychologist writing a brief cognitive assessment report.

Patient scores (0-100):
- Memory (Recall Challenge): {memory}
- Language (Fluency Challenge): {language}
- Reasoning (Detective Mission): {reasoning}
- Cognitive Health Index (CHI): {chi}

Write a professional, compassionate report. Use simple language suitable for caregivers.

Return ONLY valid JSON, no markdown:
{{
    "memory_analysis": "...",
    "language_analysis": "...",
    "reasoning_analysis": "...",
    "strengths": "...",
    "weaknesses": "...",
    "suggested_exercises": "..."
}}"""
    return json.loads(_generate(prompt))
