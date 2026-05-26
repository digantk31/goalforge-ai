import json
import asyncio
from app.integrations.gemini.client import GeminiClient

class ResultEvaluator:
    """Evaluates the outcome of a step execution."""

    def __init__(self):
        self.client = GeminiClient()

    async def evaluate(self, step, result: str) -> dict:
        """
        Evaluates if the result satisfies the step.
        Returns a dict with 'passed' and 'confidence'.
        """
        step_desc = getattr(step, 'description', str(step))
        evaluation_json = await asyncio.to_thread(self.client.evaluate_result, step_desc, result)
        try:
            return json.loads(evaluation_json)
        except json.JSONDecodeError:
            return {"passed": False, "confidence": 0.0}
