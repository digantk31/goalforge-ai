from pydantic import BeforeValidator, BaseModel, Field
from typing import Annotated, Optional, Any

PyObjectId = Annotated[str, BeforeValidator(str)]

class GoalBase(BaseModel):
    title: str = Field(..., description="The title of the goal")
    description: Optional[str] = Field(None, description="Detailed description of the goal")
    status: str = Field("pending", description="Current status of the goal")

class GoalCreate(GoalBase):
    pass

class GoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None

class GoalResponse(GoalBase):
    id: PyObjectId = Field(alias="_id")

    class Config:
        populate_by_name = True
