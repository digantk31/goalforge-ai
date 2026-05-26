from pydantic import BaseModel, Field
from typing import Optional, Any
from bson import ObjectId

class PyObjectId(str):
    """Custom type to handle MongoDB ObjectIds in Pydantic."""
    @classmethod
    def __get_pydantic_core_schema__(cls, _source_type: Any, _handler: Any) -> Any:
        from pydantic_core import core_schema
        return core_schema.str_schema()

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
