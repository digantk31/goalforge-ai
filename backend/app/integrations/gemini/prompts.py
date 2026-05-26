PLANNING_PROMPT = """Break down the following goal into a sequence of actionable steps. Output strictly as JSON array of objects with 'title', 'description', 'step_type'."""

EXECUTION_PROMPT = """You are an autonomous agent executing a step. Context: {context}. Step: {step}. Provide the result."""

EVALUATION_PROMPT = """Evaluate if the result satisfies the step. Output JSON with 'passed' (bool) and 'confidence'."""
