from fastapi import APIRouter, BackgroundTasks, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from sse_starlette.sse import EventSourceResponse

from app.db.mongodb import get_database
from app.services.goal_service import GoalService
from app.db.repositories.goal_repo import GoalRepository
from app.services.workflow_service import WorkflowService

router = APIRouter()
workflow_service = WorkflowService()

@router.post("/{goal_id}")
async def start_workflow_route(
    goal_id: str, 
    background_tasks: BackgroundTasks, 
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    goal_repo = GoalRepository(db)
    goal_service = GoalService(goal_repo)
    goal = await goal_service.get_goal(goal_id)
    
    background_tasks.add_task(
        workflow_service.start_workflow, 
        goal_id, 
        goal["description"], 
        db
    )
    
    return {"run_id": goal_id}

@router.get("/{run_id}/stream")
async def stream_workflow(run_id: str):
    return EventSourceResponse(workflow_service.stream_workflow_events(run_id))
