from pydantic import BaseModel, Field
from typing import Optional, List, Any
from enum import Enum
from datetime import datetime
from app.models.goal import PyObjectId

class StepStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"

class WorkflowStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class StepBase(BaseModel):
    name: str
    description: str
    status: StepStatus = StepStatus.PENDING
    result: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

class StepResponse(StepBase):
    id: PyObjectId = Field(alias="_id")
    workflow_id: str

    class Config:
        populate_by_name = True

class StepCreate(BaseModel):
    """Model for creating a new step in a workflow plan."""
    title: str
    description: str
    step_type: str = "action"
    order_index: int = 0

class WorkflowRunResponse(BaseModel):
    id: PyObjectId = Field(alias="_id")
    goal_id: str
    status: WorkflowStatus = WorkflowStatus.PENDING
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        populate_by_name = True
