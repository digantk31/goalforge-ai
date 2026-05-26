import asyncio
from app.integrations.gemini.client import GeminiClient
from app.engine.context import ExecutionContext

class StepExecutor:
    """Executes individual workflow steps."""

    def __init__(self):
        self.client = GeminiClient()

    async def execute_step(self, step, context: ExecutionContext) -> str:
        """Executes a step using the Gemini client and current context."""
        context_str = context.get_context_string()
        step_desc = getattr(step, 'description', str(step))
        
        # Run synchronous Gemini API call in a thread pool to avoid blocking the event loop
        result = await asyncio.to_thread(self.client.execute_step, step_desc, context_str)
        return result
