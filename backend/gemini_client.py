from typing import Optional
from google import genai
from .config import GEMINI_API_KEY, GEMINI_MODEL

class GeminiClientWrapper:
    _instance: Optional[genai.Client] = None

    @classmethod
    def get_client(cls) -> genai.Client:
        if not GEMINI_API_KEY:
            raise ValueError(
                "GEMINI_API_KEY is not set. Please add your Google AI Studio API key to .env.local or environment variables."
            )
        if cls._instance is None:
            cls._instance = genai.Client(api_key=GEMINI_API_KEY)
        return cls._instance

    @classmethod
    def get_model_name(cls) -> str:
        return GEMINI_MODEL
