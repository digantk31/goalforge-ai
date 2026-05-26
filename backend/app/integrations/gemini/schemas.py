from pydantic import BaseModel, Field
from typing import List

class StepSchema(BaseModel):
    title: str = Field(..., description="Title of the step")
    description: str = Field(..., description="Detailed description of what to do")
    step_type: str = Field(..., description="Type of the step (e.g., action, research)")

class PlanSchema(BaseModel):
    steps: List[StepSchema] = Field(..., description="List of steps to achieve the goal")

class EvaluationSchema(BaseModel):
    passed: bool = Field(..., description="Whether the step was successfully executed")
    confidence: float = Field(..., description="Confidence score from 0.0 to 1.0")

# Flat dict schemas for Google GenAI SDK (it doesn't support $ref/$defs from nested Pydantic models)
PLAN_SCHEMA_DICT = {
    "type": "OBJECT",
    "properties": {
        "steps": {
            "type": "ARRAY",
            "description": "List of steps to achieve the goal",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "title": {
                        "type": "STRING",
                        "description": "Title of the step"
                    },
                    "description": {
                        "type": "STRING",
                        "description": "Detailed description of what to do"
                    },
                    "step_type": {
                        "type": "STRING",
                        "description": "Type of the step (e.g., action, research)"
                    }
                },
                "required": ["title", "description", "step_type"]
            }
        }
    },
    "required": ["steps"]
}

EVALUATION_SCHEMA_DICT = {
    "type": "OBJECT",
    "properties": {
        "passed": {
            "type": "BOOLEAN",
            "description": "Whether the step was successfully executed"
        },
        "confidence": {
            "type": "NUMBER",
            "description": "Confidence score from 0.0 to 1.0"
        }
    },
    "required": ["passed", "confidence"]
}

