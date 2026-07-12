import json
import os
from PIL import Image
from google import genai
from dotenv import load_dotenv
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_API_KEY)
MODEL  = "gemini-2.5-flash"


def evaluate_vision_challenge(image_path: str, transcript: str, language: str = "en") -> dict:
    img = Image.open(image_path)

    if language == "hi":
        prompt = f"""आप एक दृश्य अवलोकन चुनौती का मूल्यांकन कर रहे हैं। उदार मिलान नियमों का उपयोग करें।

उपयोगकर्ता ने कहा: "{transcript}"

चरण 1 — छवि में स्पष्ट रूप से दिखाई देने वाली हर वस्तु को सरल संज्ञाओं में सूचीबद्ध करें।
चरण 2 — उदार नियमों से उपयोगकर्ता के UNIQUE शब्दों का मिलान करें (दोहराए गए शब्दों को अनदेखा करें)।
  - आंशिक मिलान: "पार्किंग" → "पार्किंग लॉट" → सही
  - पर्यायवाची: "गाड़ी"="कार" → सही
  - घटक: "पहिया" और छवि में "कार" → सही
  - केवल तब WRONG जब शब्द का कोई संबंध न हो
चरण 3 — केवल UNIQUE शब्द गिनें।
चरण 4 — हिंदी में एक छोटा प्रोत्साहन वाक्य।

केवल valid JSON:
{{"all_objects":["वस्तु1"],"correct_words":["शब्द1"],"wrong_words":[],"correct_count":1,"wrong_count":0,"score":80,"feedback":"शानदार!"}}"""
    else:
        prompt = f"""You are evaluating a visual observation challenge. Be GENEROUS in matching.

User said: "{transcript}"

STEP 1 — List every clearly visible object using simple nouns.
STEP 2 — Match UNIQUE user words (ignore repeats of the same word):
  - Partial match: "parking" → "parking lot" = CORRECT
  - Synonym: "couch"="sofa", "tv"="television" = CORRECT
  - Component: "wheel" + image has "car" = CORRECT
  - Only WRONG if zero connection to anything visible
STEP 3 — Count unique correct and wrong.
STEP 4 — One short encouraging feedback sentence (max 12 words).

Return ONLY valid JSON:
{{"all_objects":["obj1"],"correct_words":["w1"],"wrong_words":[],"correct_count":1,"wrong_count":0,"score":80,"feedback":"Great observation!"}}"""

    response = client.models.generate_content(
        model    = MODEL,
        contents = [prompt, img],
    )
    text = response.text.replace("```json","").replace("```","").strip()
    return json.loads(text)
