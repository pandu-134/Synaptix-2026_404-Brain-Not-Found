import google.generativeai as genai
import json
import os
import typing_extensions as typing
from dotenv import load_dotenv

# Load API key
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("No GEMINI_API_KEY found. Please check your .env file.")

genai.configure(api_key=api_key)

class QuestionSchema(typing.TypedDict):
    Question_Text: str
    Option_A: str
    Option_B: str
    Option_C: str
    Option_D: str
    Correct_Option: str 
    Topic: str
    Difficulty_Level: int

system_instruction = "You are an expert Computer Science Engineering professor creating an adaptive test."

model = genai.GenerativeModel(
    'gemini-2.5-flash',
    system_instruction=system_instruction
)

CURRICULUM_GUIDELINES = {
    "Programming Fundamentals": {
        "Level 1": "Basic concepts: Loops, Variables, Data Types in Python or Java.",
        "Level 5": "Advanced concepts: Object-Oriented Programming (OOP), memory management, multithreading."
    },
    "Web Development": {
        "Level 1": "Frontend basics: HTML structure, CSS styling, simple DOM manipulation.",
        "Level 5": "Advanced full-stack: React state management, hooks, backend API routing (Flask/Node), CORS."
    },
    "Advanced Tech": {
        "Level 1": "Introductory concepts: What is supervised learning? What is symmetric encryption?",
        "Level 5": "Deep implementation: Data preprocessing techniques, neural network architectures, or how AES works."
    }
}

def generate_dynamic_question(topic, difficulty_level):
    topic_context = ""
    if topic in CURRICULUM_GUIDELINES:
        level_1 = CURRICULUM_GUIDELINES[topic]["Level 1"]
        level_5 = CURRICULUM_GUIDELINES[topic]["Level 5"]
        topic_context = f"Context: Level 1 covers '{level_1}'. Level 5 covers '{level_5}'."

    prompt = f"""
    Generate exactly ONE multiple-choice question about '{topic}' at a difficulty level of {difficulty_level} out of 5.
    {topic_context}
    The Correct_Option MUST be strictly one of: "A", "B", "C", or "D".
    """

    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                response_schema=QuestionSchema,
                temperature=0.7, 
            )
        )
        return json.loads(response.text)

    except Exception as e:
        print(f"AI Generation Failed: {e}")
        return {
            "Question_Text": "System overload fallback: What does HTML stand for?",
            "Option_A": "Hyper Text Markup Language", "Option_B": "High Tech Modern Language", 
            "Option_C": "Hyper Transfer Markup Link", "Option_D": "Home Tool Markup Language",
            "Correct_Option": "A", "Topic": topic, "Difficulty_Level": difficulty_level
        }