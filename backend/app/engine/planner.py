import json
from typing import List
from app.integrations.gemini.client import GeminiClient
try:
    from app.models.workflow import StepCreate
except ImportError:
    # Dummy definition if app.models.workflow doesn't exist yet
    from pydantic import BaseModel
    class StepCreate(BaseModel):
        title: str
        description: str
        step_type: str
        order_index: int = 0

class WorkflowPlanner:
    """Plans a workflow by breaking down a goal into steps."""

    def __init__(self):
        self.client = GeminiClient()

    def plan_workflow(self, goal: str) -> List[StepCreate]:
        """Generates a list of Step models from a goal."""
        json_plan = self.client.generate_structured_plan(goal)
        try:
            plan_data = json.loads(json_plan)
            steps_data = plan_data.get("steps", [])
            steps = []
            for idx, step in enumerate(steps_data):
                steps.append(
                    StepCreate(
                        title=step.get("title", f"Step {idx+1}"),
                        description=step.get("description", ""),
                        step_type=step.get("step_type", "action"),
                        order_index=idx
                    )
                )
            return steps
        except json.JSONDecodeError:
            print("Failed to decode JSON plan from Gemini.")
            return []
