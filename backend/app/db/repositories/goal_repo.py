from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from app.db.collections import GOALS_COLLECTION
from app.models.goal import GoalCreate, GoalUpdate
from typing import List, Optional

class GoalRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db[GOALS_COLLECTION]

    async def create_goal(self, goal: GoalCreate) -> dict:
        goal_dict = goal.model_dump()
        result = await self.collection.insert_one(goal_dict)
        created_goal = await self.get_goal(str(result.inserted_id))
        return created_goal

    async def get_goal(self, goal_id: str) -> Optional[dict]:
        if not ObjectId.is_valid(goal_id):
            return None
        return await self.collection.find_one({"_id": ObjectId(goal_id)})

    async def list_goals(self, skip: int = 0, limit: int = 100) -> List[dict]:
        cursor = self.collection.find().skip(skip).limit(limit)
        return await cursor.to_list(length=limit)

    async def update_goal(self, goal_id: str, goal_update: GoalUpdate) -> Optional[dict]:
        if not ObjectId.is_valid(goal_id):
            return None
        update_data = {k: v for k, v in goal_update.model_dump().items() if v is not None}
        if not update_data:
            return await self.get_goal(goal_id)
        
        await self.collection.update_one(
            {"_id": ObjectId(goal_id)},
            {"$set": update_data}
        )
        return await self.get_goal(goal_id)

    async def delete_goal(self, goal_id: str) -> bool:
        if not ObjectId.is_valid(goal_id):
            return False
        result = await self.collection.delete_one({"_id": ObjectId(goal_id)})
        return result.deleted_count > 0
