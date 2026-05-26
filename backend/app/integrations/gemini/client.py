import json
from google import genai
from google.genai import types

# Assuming config is available in app.core
# If not, this needs to be adjusted
try:
    from app.core import config
    API_KEY = config.GEMINI_API_KEY
except ImportError:
    import os
    API_KEY = os.environ.get("GEMINI_API_KEY", "dummy_key")

from .prompts import PLANNING_PROMPT, EXECUTION_PROMPT, EVALUATION_PROMPT
from .schemas import PlanSchema, EvaluationSchema

class GeminiClient:
    """Client for interacting with Google Gemini API."""

    def __init__(self):
        self.client = genai.Client(api_key=API_KEY)
        self.model_id = "gemini-2.5-pro"

    def generate_structured_plan(self, goal: str) -> str:
        """Generates a structured plan for a given goal."""
        response = self.client.models.generate_content(
            model=self.model_id,
            contents=[PLANNING_PROMPT, f"Goal: {goal}"],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=PlanSchema,
                temperature=0.2,
            ),
        )
        return response.text

    def execute_step(self, step_desc: str, context: str) -> str:
        """Executes a single step given the context."""
        prompt = EXECUTION_PROMPT.format(context=context, step=step_desc)
        response = self.client.models.generate_content(
            model=self.model_id,
            contents=prompt,
        )
        return response.text

    def evaluate_result(self, step_desc: str, result: str) -> str:
        """Evaluates if the result satisfies the step."""
        prompt = EVALUATION_PROMPT + f"\n\nStep: {step_desc}\nResult: {result}"
        response = self.client.models.generate_content(
            model=self.model_id,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=EvaluationSchema,
                temperature=0.1,
            ),
        )
        return response.text
