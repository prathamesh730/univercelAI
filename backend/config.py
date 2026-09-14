import os
from pathlib import Path
from dotenv import load_dotenv

# Search for .env.local or .env in project root or current dir
BASE_DIR = Path(__file__).resolve().parent.parent
dotenv_paths = [
    BASE_DIR / '.env.local',
    BASE_DIR / '.env',
    Path('.env.local'),
    Path('.env')
]

for p in dotenv_paths:
    if p.exists():
        load_dotenv(dotenv_path=p, override=False)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or os.getenv("NEXT_PUBLIC_GEMINI_API_KEY")

# Primary Gemini model: fast, robust tool calling, latest capabilities
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.7-flash")
PORT = int(os.getenv("PORT", 8000))
HOST = os.getenv("HOST", "0.0.0.0")
