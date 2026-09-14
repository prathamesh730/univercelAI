import os
import json
import shutil
from pathlib import Path
from typing import Optional, List
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse

from .config import PORT, HOST, GEMINI_API_KEY, BASE_DIR
from .agent import AutonomousAgent
from .tools.registry import default_registry

app = FastAPI(
    title="Gemini AI Agent Backend",
    description="Autonomous Gemini 3.7 Agent with Modular Tool Calling and SSE Streaming",
    version="2.1.0"
)

# Enable CORS for Next.js frontend (localhost:3000, 127.0.0.1:3000, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOADS_DIR = BASE_DIR / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

class AgentRunRequest(BaseModel):
    task: str
    files: Optional[List[str]] = None

@app.get("/health")
def health_check():
    return {
        "status": "online",
        "has_gemini_key": bool(GEMINI_API_KEY),
        "available_tools": default_registry.list_tools()
    }

@app.post("/api/agent/upload")
async def upload_file(file: UploadFile = File(...)):
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    # Secure filename
    clean_filename = Path(file.filename).name
    save_path = UPLOADS_DIR / clean_filename

    try:
        with open(save_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        file_size = save_path.stat().st_size
        return {
            "status": "success",
            "file_name": clean_filename,
            "server_path": f"uploads/{clean_filename}",
            "size": file_size
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

@app.get("/api/agent/stream")
async def stream_agent(task: str, files: Optional[str] = None):
    if not task or not task.strip():
        raise HTTPException(status_code=400, detail="Task cannot be empty")
    
    attached_file_list: List[str] = []
    if files:
        try:
            parsed = json.loads(files)
            if isinstance(parsed, list):
                attached_file_list = [str(f) for f in parsed]
            else:
                attached_file_list = [str(files)]
        except Exception:
            attached_file_list = [f.strip() for f in files.split(",") if f.strip()]

    agent = AutonomousAgent(task=task, attached_files=attached_file_list)

    async def event_generator():
        try:
            async for event in agent.execute_stream():
                yield {
                    "event": "message",
                    "data": json.dumps(event)
                }
        except Exception as e:
            yield {
                "event": "message",
                "data": json.dumps({
                    "event": "error",
                    "step": 0,
                    "error": f"Agent execution failed: {str(e)}"
                })
            }

    return EventSourceResponse(event_generator())

@app.post("/api/agent/run")
async def run_agent(req: AgentRunRequest):
    if not req.task or not req.task.strip():
        raise HTTPException(status_code=400, detail="Task cannot be empty")
    
    agent = AutonomousAgent(task=req.task, attached_files=req.files or [])
    final_result = None
    last_event = None

    async for event in agent.execute_stream():
        last_event = event
        if event.get("event") == "completed":
            final_result = event.get("result")
        elif event.get("event") == "error":
            raise HTTPException(status_code=500, detail=event.get("error"))

    if not final_result:
        raise HTTPException(status_code=500, detail="Agent did not produce a completion result")

    return final_result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host=HOST, port=PORT, reload=True)
