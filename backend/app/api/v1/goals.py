from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.models.goal import GoalCreate, GoalUpdate, GoalResponse
from app.services.goal_service import GoalService
from app.api.deps import get_goal_service
from app.core.exceptions import GoalNotFoundError

router = APIRouter()

@router.post("/", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
async def create_goal(
    goal: GoalCreate,
    service: GoalService = Depends(get_goal_service)
):
    return await service.create_goal(goal)

@router.get("/", response_model=List[GoalResponse])
async def list_goals(
    skip: int = 0,
    limit: int = 100,
    service: GoalService = Depends(get_goal_service)
):
    return await service.list_goals(skip=skip, limit=limit)

@router.get("/{goal_id}", response_model=GoalResponse)
async def get_goal(
    goal_id: str,
    service: GoalService = Depends(get_goal_service)
):
    try:
        return await service.get_goal(goal_id)
    except GoalNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
