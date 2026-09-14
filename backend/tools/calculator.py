import ast
import operator
import math
from typing import Any, Dict
from .base import BaseTool

class CalculatorTool(BaseTool):
    name = "Calculator"
    description = "Executes precise mathematical calculations, arithmetic expressions, percentage increases/decreases, financial formulas, and statistical ratios."
    parameters_schema = {
        "type": "OBJECT",
        "properties": {
            "expression": {
                "type": "STRING",
                "description": "Mathematical expression to evaluate, e.g. '(725 - 500) / 500 * 100', '1500 * 1.08 ** 5', 'sqrt(144) + 25'."
            }
        },
        "required": ["expression"]
    }

    _OPERATORS = {
        ast.Add: operator.add,
        ast.Sub: operator.sub,
        ast.Mult: operator.mul,
        ast.Div: operator.truediv,
        ast.FloorDiv: operator.floordiv,
        ast.Mod: operator.mod,
        ast.Pow: operator.pow,
        ast.USub: operator.neg,
        ast.UAdd: operator.pos,
    }

    _FUNCTIONS = {
        'sqrt': math.sqrt,
        'sin': math.sin,
        'cos': math.cos,
        'tan': math.tan,
        'log': math.log,
        'log10': math.log10,
        'exp': math.exp,
        'abs': abs,
        'round': round,
        'floor': math.floor,
        'ceil': math.ceil,
        'pi': math.pi,
        'e': math.e,
    }

    def _safe_eval(self, node):
        if isinstance(node, ast.Constant):
            return node.value
        elif isinstance(node, ast.BinOp):
            left = self._safe_eval(node.left)
            right = self._safe_eval(node.right)
            op_type = type(node.op)
            if op_type in self._OPERATORS:
                return self._OPERATORS[op_type](left, right)
            raise ValueError(f"Unsupported binary operator: {op_type}")
        elif isinstance(node, ast.UnaryOp):
            operand = self._safe_eval(node.operand)
            op_type = type(node.op)
            if op_type in self._OPERATORS:
                return self._OPERATORS[op_type](operand)
            raise ValueError(f"Unsupported unary operator: {op_type}")
        elif isinstance(node, ast.Call):
            if isinstance(node.func, ast.Name) and node.func.id in self._FUNCTIONS:
                args = [self._safe_eval(arg) for arg in node.args]
                return self._FUNCTIONS[node.func.id](*args)
            raise ValueError(f"Unsupported function call: {ast.dump(node)}")
        elif isinstance(node, ast.Name):
            if node.id in self._FUNCTIONS:
                return self._FUNCTIONS[node.id]
            raise ValueError(f"Undefined variable: {node.id}")
        else:
            raise ValueError(f"Unsupported AST node: {type(node)}")

    def execute(self, expression: str) -> Dict[str, Any]:
        cleaned = expression.strip().replace("^", "**").replace("×", "*").replace("÷", "/")
        try:
            tree = ast.parse(cleaned, mode='eval')
            result = self._safe_eval(tree.body)
            # Format nicely
            if isinstance(result, float) and result.is_integer():
                formatted_result = int(result)
            elif isinstance(result, float):
                formatted_result = round(result, 6)
            else:
                formatted_result = result

            return {
                "status": "success",
                "expression": expression,
                "result": formatted_result,
                "formatted": str(formatted_result)
            }
        except Exception as e:
            return {
                "status": "error",
                "expression": expression,
                "error": str(e)
            }
