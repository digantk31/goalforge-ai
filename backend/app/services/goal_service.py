from app.db.repositories.goal_repo import GoalRepository
from app.models.goal import GoalCreate, GoalUpdate
from app.core.exceptions import GoalNotFoundError
from typing import List

class GoalService:
    def __init__(self, repo: GoalRepository):
        self.repo = repo

    async def create_goal(self, goal: GoalCreate) -> dict:
        return await self.repo.create_goal(goal)

    async def get_goal(self, goal_id: str) -> dict:
        goal = await self.repo.get_goal(goal_id)
        if not goal:
            raise GoalNotFoundError(f"Goal with id {goal_id} not found")
        return goal

    async def list_goals(self, skip: int = 0, limit: int = 100) -> List[dict]:
        return await self.repo.list_goals(skip=skip, limit=limit)

    async def update_goal(self, goal_id: str, goal_update: GoalUpdate) -> dict:
        goal = await self.repo.update_goal(goal_id, goal_update)
        if not goal:
            raise GoalNotFoundError(f"Goal with id {goal_id} not found")
        return goal

    async def delete_goal(self, goal_id: str) -> bool:
        success = await self.repo.delete_goal(goal_id)
        if not success:
            raise GoalNotFoundError(f"Goal with id {goal_id} not found")
        return True
