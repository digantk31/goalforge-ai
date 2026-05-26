import json
import time
import logging
from google import genai
from google.genai import types
from google.genai.errors import ClientError

from app.config import settings

API_KEY = settings.GEMINI_API_KEY

from .prompts import PLANNING_PROMPT, EXECUTION_PROMPT, EVALUATION_PROMPT
from .schemas import PLAN_SCHEMA_DICT, EVALUATION_SCHEMA_DICT

logger = logging.getLogger(__name__)

class GeminiClient:
    """Client for interacting with Google Gemini API."""

    MAX_RETRIES = 3
    BASE_DELAY = 2  # seconds

    def __init__(self):
        self.client = genai.Client(api_key=API_KEY)
        self.model_id = "gemini-2.0-flash"

    def _retry_on_rate_limit(self, func, *args, **kwargs):
        """Retry a function call with exponential backoff on 429 errors."""
        for attempt in range(self.MAX_RETRIES):
            try:
                return func(*args, **kwargs)
            except ClientError as e:
                if "429" in str(e) and attempt < self.MAX_RETRIES - 1:
                    delay = self.BASE_DELAY * (2 ** attempt)
                    logger.warning(f"Rate limited (429). Retrying in {delay}s... (attempt {attempt + 1}/{self.MAX_RETRIES})")
                    time.sleep(delay)
                else:
                    raise

    def generate_structured_plan(self, goal: str) -> str:
        """Generates a structured plan for a given goal."""
        return self._retry_on_rate_limit(
            self.client.models.generate_content,
            model=self.model_id,
            contents=[PLANNING_PROMPT, f"Goal: {goal}"],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=PLAN_SCHEMA_DICT,
                temperature=0.2,
            ),
        ).text

    def execute_step(self, step_desc: str, context: str) -> str:
        """Executes a single step given the context."""
        prompt = EXECUTION_PROMPT.format(context=context, step=step_desc)
        return self._retry_on_rate_limit(
            self.client.models.generate_content,
            model=self.model_id,
            contents=prompt,
        ).text

    def evaluate_result(self, step_desc: str, result: str) -> str:
        """Evaluates if the result satisfies the step."""
        prompt = EVALUATION_PROMPT + f"\n\nStep: {step_desc}\nResult: {result}"
        return self._retry_on_rate_limit(
            self.client.models.generate_content,
            model=self.model_id,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=EVALUATION_SCHEMA_DICT,
                temperature=0.1,
            ),
        ).text

