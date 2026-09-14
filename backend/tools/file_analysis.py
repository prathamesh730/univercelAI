import os
from pathlib import Path
from typing import Any, Dict, List
from .base import BaseTool

class FileAnalysisTool(BaseTool):
    name = "FileAnalysis"
    description = "Reads, parses, and extracts text or data from local files, documents, Word docs (.docx), PDF files (.pdf), JSON, Markdown, text, and source code files in the workspace."
    parameters_schema = {
        "type": "OBJECT",
        "properties": {
            "file_path": {
                "type": "STRING",
                "description": "Relative or absolute file path or filename to read, e.g. 'BUILD_Framework_Hackathon_AI_Skill.docx', 'package.json', 'data.pdf'."
            },
            "query": {
                "type": "STRING",
                "description": "Optional search focus or specific section/topic to extract from the file."
            }
        },
        "required": ["file_path"]
    }

    def _find_file(self, file_path_str: str) -> Path | None:
        p = Path(file_path_str)
        if p.exists() and p.is_file():
            return p

        # Check in project root
        root = Path(__file__).resolve().parent.parent.parent
        target = root / file_path_str
        if target.exists() and target.is_file():
            return target

        # Search by filename in root
        fname = Path(file_path_str).name
        for match in root.glob(f"**/{fname}"):
            if match.is_file() and not any(part.startswith(('.', 'node_modules', '.next')) for part in match.parts):
                return match
        return None

    def execute(self, file_path: str, query: str = "") -> Dict[str, Any]:
        file_path_obj = self._find_file(file_path)
        if not file_path_obj:
            return {
                "status": "error",
                "file_path": file_path,
                "error": f"File '{file_path}' not found in the workspace."
            }

        suffix = file_path_obj.suffix.lower()
        extracted_text = ""

        try:
            if suffix in ['.docx']:
                import docx
                doc = docx.Document(file_path_obj)
                paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
                extracted_text = "\n".join(paragraphs)
            elif suffix in ['.pdf']:
                import pypdf
                reader = pypdf.PdfReader(file_path_obj)
                pages_text = []
                for i, page in enumerate(reader.pages):
                    text = page.extract_text()
                    if text:
                        pages_text.append(f"--- Page {i+1} ---\n{text}")
                extracted_text = "\n\n".join(pages_text)
            else:
                # Text / json / md / ts / py / csv
                with open(file_path_obj, "r", encoding="utf-8", errors="ignore") as f:
                    extracted_text = f.read()

            # Truncate if gigantic to preserve context
            total_len = len(extracted_text)
            truncated_text = extracted_text[:12000]

            return {
                "status": "success",
                "file_name": file_path_obj.name,
                "file_path": str(file_path_obj),
                "total_characters": total_len,
                "content_preview": truncated_text,
                "query": query
            }
        except Exception as e:
            return {
                "status": "error",
                "file_path": file_path,
                "error": f"Failed to read file: {str(e)}"
            }
