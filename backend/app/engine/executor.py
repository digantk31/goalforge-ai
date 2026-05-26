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
        
        # Calling synchronous execute_step. 
        # In a real async framework, you might want to run this in a thread pool.
        result = self.client.execute_step(step_desc, context_str)
        return result
