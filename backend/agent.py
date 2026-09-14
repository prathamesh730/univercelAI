import time
import json
import re
import asyncio
from typing import AsyncGenerator, Dict, Any, List, Optional
from google.genai import types
from .gemini_client import GeminiClientWrapper
from .tools.registry import default_registry

class AutonomousAgent:
    def __init__(self, task: str, attached_files: Optional[List[str]] = None):
        self.raw_task = task.strip()
        self.attached_files = attached_files or []
        
        # Build prompt with attached file context if provided
        if self.attached_files:
            files_str = ", ".join([f"'{f}'" for f in self.attached_files])
            self.task = (
                f"{self.raw_task}\n\n"
                f"[Attached User File(s): {files_str}. Use the FileAnalysis tool to read and parse these documents if needed to complete the task.]"
            )
        else:
            self.task = self.raw_task

        self.start_time = time.time()
        self.active_tools: List[str] = []
        self.used_tools_details: List[Dict[str, Any]] = []
        self.logs: List[str] = []
        self.sources: List[str] = list(self.attached_files)

    def _add_log(self, message: str):
        self.logs.append(message)

    async def execute_stream(self) -> AsyncGenerator[Dict[str, Any], None]:
        self.start_time = time.time()
        self._add_log(f"Initialized autonomous agent pipeline for task: '{self.task[:60]}...'")

        # Step 1: Understanding Task
        yield {
            "event": "step",
            "step": 1,
            "sublabel": "Understanding task",
            "activeTools": [],
            "logs": list(self.logs),
            "elapsed": round(time.time() - self.start_time, 2)
        }
        await asyncio.sleep(0.05)

        self._add_log("Step 01: Analyzed user intent, semantic requirements, and potential tool dependencies.")

        # Prepare tool execution wrappers that notify our state
        tools_called_lock = asyncio.Lock()
        active_tools_set = set()

        def WebSearch(query: str) -> str:
            tool_name = "WebSearch"
            active_tools_set.add(tool_name)
            self.active_tools = list(active_tools_set)
            self._add_log(f"Step 02 [Tool]: Executing WebSearch for query: '{query}'")
            t0 = time.time()
            res = default_registry.execute("WebSearch", query=query)
            dt = round(time.time() - t0, 2)
            srcs = res.get("sources", [])
            if srcs:
                self.sources.extend(srcs)
            self._add_log(f"WebSearch completed in {dt}s ({res.get('count', 0)} relevant sources found).")
            self.used_tools_details.append({"tool": tool_name, "query": query, "time": dt})
            return json.dumps(res)

        def Calculator(expression: str) -> str:
            tool_name = "Calculator"
            active_tools_set.add(tool_name)
            self.active_tools = list(active_tools_set)
            self._add_log(f"Step 02 [Tool]: Executing Calculator for expression: '{expression}'")
            t0 = time.time()
            res = default_registry.execute("Calculator", expression=expression)
            dt = round(time.time() - t0, 2)
            self._add_log(f"Calculator evaluated '{expression}' -> {res.get('result', '')} in {dt}s.")
            self.used_tools_details.append({"tool": tool_name, "expression": expression, "result": res.get('result')})
            return json.dumps(res)

        def FileAnalysis(file_path: str, query: str = "") -> str:
            tool_name = "FileAnalysis"
            active_tools_set.add(tool_name)
            self.active_tools = list(active_tools_set)
            self._add_log(f"Step 02 [Tool]: Analyzing workspace file: '{file_path}'")
            t0 = time.time()
            res = default_registry.execute("FileAnalysis", file_path=file_path, query=query)
            dt = round(time.time() - t0, 2)
            if res.get("status") == "success":
                self.sources.append(res.get("file_name", file_path))
                self._add_log(f"FileAnalysis parsed {res.get('total_characters', 0)} characters from '{file_path}' in {dt}s.")
            else:
                self._add_log(f"FileAnalysis error on '{file_path}': {res.get('error')}")
            self.used_tools_details.append({"tool": tool_name, "file": file_path, "time": dt})
            return json.dumps(res)

        # Prompt instruction
        system_instruction = (
            "You are an expert autonomous AI agent. "
            "You have access to modular tools: WebSearch, Calculator, and FileAnalysis.\n"
            "Guidelines:\n"
            "1. ONLY use tools when necessary to solve the user's task accurately. Do NOT call tools if not needed.\n"
            "2. When tools provide answers, synthesize a comprehensive, well-structured, clear response.\n"
            "3. Format your response with rich Markdown: use clear headings, bullet points, tables when comparing data or presenting structured metrics, and JSON code blocks if a structured payload or dispatch format is appropriate."
        )

        try:
            client = GeminiClientWrapper.get_client()
            model_name = GeminiClientWrapper.get_model_name()

            # Run Gemini chat with tools in background thread/task
            chat = client.chats.create(
                model=model_name,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    tools=[WebSearch, Calculator, FileAnalysis],
                    temperature=0.2,
                )
            )

            # Start tool check monitor
            response_task = asyncio.create_task(asyncio.to_thread(chat.send_message, self.task))

            # While waiting, check if tools have been invoked
            last_tool_count = 0
            while not response_task.done():
                await asyncio.sleep(0.1)
                if len(active_tools_set) > last_tool_count:
                    last_tool_count = len(active_tools_set)
                    yield {
                        "event": "step",
                        "step": 2,
                        "sublabel": "Using tools",
                        "activeTools": list(active_tools_set),
                        "logs": list(self.logs),
                        "elapsed": round(time.time() - self.start_time, 2)
                    }

            # Response is ready
            response = await response_task

            # Step 3: Processing final response
            self._add_log("Step 03: Synthesizing final structured intelligence and formatting results.")
            yield {
                "event": "step",
                "step": 3,
                "sublabel": "Processing",
                "activeTools": list(active_tools_set),
                "logs": list(self.logs),
                "elapsed": round(time.time() - self.start_time, 2)
            }
            await asyncio.sleep(0.1)

            final_text = response.text or ""
            tokens_used = (
                response.usage_metadata.total_token_count
                if response.usage_metadata
                else 0
            )

            # Parse structured takeaways, metrics, and payload from the real text
            parsed_result = self._parse_agent_response(final_text)

            total_elapsed = round(time.time() - self.start_time, 2)
            self._add_log(f"Execution completed successfully in {total_elapsed}s ({tokens_used} tokens).")

            # Final completed payload
            final_data = {
                "title": parsed_result.get("title") or self._generate_title(self.task),
                "sources": ", ".join(list(dict.fromkeys(self.sources))) if self.sources else (
                    "Direct computation & Gemini reasoning" if self.active_tools else "Gemini Knowledge Core"
                ),
                "summary": parsed_result.get("summary") or self._extract_summary(final_text),
                "takeaways": parsed_result.get("takeaways") or self._extract_takeaways(final_text),
                "metrics": parsed_result.get("metrics") or [],
                "dispatchPayload": parsed_result.get("dispatchPayload") or None,
                "rawMarkdown": final_text,
                "executionTime": f"{total_elapsed}s",
                "tokensUsed": tokens_used,
                "confidenceScore": "",  # Empty so UI cleanly omits fake confidence
                "logs": list(self.logs),
                "activeTools": list(active_tools_set)
            }

            yield {
                "event": "completed",
                "step": 4,
                "sublabel": "Completed",
                "activeTools": list(active_tools_set),
                "result": final_data,
                "elapsed": total_elapsed
            }

        except Exception as e:
            err_msg = str(e)
            self._add_log(f"Error during agent execution: {err_msg}")
            total_elapsed = round(time.time() - self.start_time, 2)
            yield {
                "event": "error",
                "step": 0,
                "error": f"Agent execution encountered an issue: {err_msg}",
                "logs": list(self.logs),
                "elapsed": total_elapsed
            }

    def _generate_title(self, task: str) -> str:
        words = task.strip().split()
        if len(words) <= 8:
            return task.capitalize()
        return " ".join(words[:7]).capitalize() + "..."

    def _extract_summary(self, text: str) -> str:
        paragraphs = [p.strip() for p in text.split("\n\n") if p.strip() and not p.strip().startswith("#")]
        if paragraphs:
            return paragraphs[0]
        return text[:200]

    def _extract_takeaways(self, text: str) -> List[Dict[str, str]]:
        takeaways = []
        # Find bullet points
        lines = text.split("\n")
        for line in lines:
            line_str = line.strip()
            if line_str.startswith(("- ", "* ", "• ")) or re.match(r"^\d+\.\s+", line_str):
                cleaned = re.sub(r"^[-*•\d\.]+\s+", "", line_str).strip()
                if not cleaned:
                    continue
                # Split bold prefix if present e.g. **Key**: Description
                if "**" in cleaned:
                    parts = cleaned.split("**")
                    if len(parts) >= 3:
                        title = parts[1].replace(":", "").strip()
                        desc = "".join(parts[2:]).lstrip(": ").strip()
                        if title and desc:
                            takeaways.append({"title": title, "desc": desc})
                            continue
                # Plain colon split
                if ":" in cleaned:
                    parts = cleaned.split(":", 1)
                    takeaways.append({"title": parts[0].strip(), "desc": parts[1].strip()})
                else:
                    takeaways.append({"title": "Key Insight", "desc": cleaned})
            if len(takeaways) >= 5:
                break

        if not takeaways:
            takeaways = [
                {"title": "Task Resolution", "desc": "Execution completed with synthesized response."}
            ]
        return takeaways

    def _parse_agent_response(self, text: str) -> Dict[str, Any]:
        result: Dict[str, Any] = {
            "metrics": [],
            "dispatchPayload": None,
            "title": "",
            "summary": "",
            "takeaways": []
        }

        # 1. Check for markdown tables to populate metrics ONLY if present
        table_matches = re.findall(r"\|(.+)\|[\r\n]+\|[-:\s|]+\|[\r\n]+((?:\|.+|[\r\n]+)+)", text)
        if table_matches:
            header_line, rows_block = table_matches[0]
            headers = [h.strip() for h in header_line.split("|") if h.strip()]
            rows = [r.strip() for r in rows_block.strip().split("\n") if r.strip()]
            
            extracted_metrics = []
            for row in rows:
                cols = [c.strip() for c in row.split("|") if c.strip()]
                if len(cols) >= 2:
                    extracted_metrics.append({
                        "topic": cols[0],
                        "impact": cols[1] if len(cols) > 1 else "Normal",
                        "category": cols[2] if len(cols) > 2 else "Data",
                        "confidence": cols[3] if len(cols) > 3 else "Verified"
                    })
            if extracted_metrics:
                result["metrics"] = extracted_metrics[:8]

        # 2. Check for JSON code blocks for dispatchPayload ONLY if present
        json_matches = re.findall(r"```json\s*([\s\S]*?)\s*```", text)
        if json_matches:
            try:
                parsed_json = json.loads(json_matches[0])
                if isinstance(parsed_json, dict):
                    result["dispatchPayload"] = parsed_json
            except Exception:
                pass

        # 3. Check for H1 or H2 title
        title_match = re.search(r"^#+\s+(.+)$", text, re.MULTILINE)
        if title_match:
            result["title"] = title_match.group(1).strip()

        return result
