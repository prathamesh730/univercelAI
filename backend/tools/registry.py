from typing import Dict, List, Any, Optional
from .base import BaseTool
from .web_search import WebSearchTool
from .calculator import CalculatorTool
from .file_analysis import FileAnalysisTool

class ToolRegistry:
    def __init__(self):
        self._tools: Dict[str, BaseTool] = {}
        # Register default initial tools
        self.register(WebSearchTool())
        self.register(CalculatorTool())
        self.register(FileAnalysisTool())

    def register(self, tool: BaseTool):
        self._tools[tool.name] = tool

    def get_tool(self, name: str) -> Optional[BaseTool]:
        return self._tools.get(name)

    def list_tools(self) -> List[str]:
        return list(self._tools.keys())

    def get_gemini_declarations(self) -> List[Dict[str, Any]]:
        """Format tools for Google Gemini Function Calling API."""
        declarations = []
        for tool in self._tools.values():
            declarations.append({
                "name": tool.name,
                "description": tool.description,
                "parameters": tool.parameters_schema
            })
        return declarations

    def execute(self, tool_name: str, **kwargs) -> Dict[str, Any]:
        tool = self.get_tool(tool_name)
        if not tool:
            return {
                "status": "error",
                "tool": tool_name,
                "error": f"Tool '{tool_name}' not found in registry."
            }
        return tool.execute(**kwargs)

default_registry = ToolRegistry()
