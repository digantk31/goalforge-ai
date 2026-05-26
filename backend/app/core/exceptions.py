class GoalForgeException(Exception):
    """Base exception for GoalForge API."""
    pass

class GoalNotFoundError(GoalForgeException):
    """Raised when a goal is not found."""
    pass

class WorkflowError(GoalForgeException):
    """Raised when there is an error in the workflow execution."""
    pass
