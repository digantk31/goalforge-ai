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
