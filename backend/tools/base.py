from abc import ABC, abstractmethod
from typing import Any, Dict

class BaseTool(ABC):
    name: str
    description: str
    parameters_schema: Dict[str, Any]

    @abstractmethod
    def execute(self, **kwargs) -> Dict[str, Any]:
        """Execute the tool synchronously or asynchronously and return structured dictionary."""
        pass
