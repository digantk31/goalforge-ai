from typing import List, Dict, Any
from pydantic import BaseModel

class ExecutionContext(BaseModel):
    """Context holding state for the workflow execution."""
    goal_id: str
    run_id: str
    history: List[Dict[str, Any]] = []
    
    def add_result(self, step_title: str, result: str):
        """Adds a step result to the execution history."""
        self.history.append({"step": step_title, "result": result})
        
    def get_context_string(self) -> str:
        """Returns a string representation of the history for the LLM."""
        if not self.history:
            return "No previous steps executed yet."
        context_str = "Previous step results:\n"
        for item in self.history:
            context_str += f"- {item['step']}: {item['result']}\n"
        return context_str
