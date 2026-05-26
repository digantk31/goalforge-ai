from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from app.db.collections import WORKFLOWS_COLLECTION, STEPS_COLLECTION
from app.models.workflow import StepStatus, WorkflowStatus
from typing import List, Optional
from datetime import datetime, timezone

class WorkflowRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.workflow_collection = db[WORKFLOWS_COLLECTION]
        self.steps_collection = db[STEPS_COLLECTION]

    async def create_workflow_run(self, goal_id: str) -> dict:
        workflow = {
            "goal_id": goal_id,
            "status": WorkflowStatus.PENDING.value,
            "started_at": datetime.now(timezone.utc)
        }
        result = await self.workflow_collection.insert_one(workflow)
        return await self.get_workflow_run(str(result.inserted_id))

    async def get_workflow_run(self, workflow_id: str) -> Optional[dict]:
        if not ObjectId.is_valid(workflow_id):
            return None
        return await self.workflow_collection.find_one({"_id": ObjectId(workflow_id)})

    async def create_steps(self, workflow_id: str, steps: List[dict]) -> List[dict]:
        for step in steps:
            step["workflow_id"] = workflow_id
            step["status"] = StepStatus.PENDING.value
            
        result = await self.steps_collection.insert_many(steps)
        inserted_ids = result.inserted_ids
        
        cursor = self.steps_collection.find({"_id": {"$in": inserted_ids}})
        return await cursor.to_list(length=len(steps))

    async def update_step_status(self, step_id: str, status: StepStatus, result_text: Optional[str] = None) -> Optional[dict]:
        if not ObjectId.is_valid(step_id):
            return None
            
        update_data = {"status": status.value}
        if result_text is not None:
            update_data["result"] = result_text
            
        if status in [StepStatus.COMPLETED, StepStatus.FAILED]:
            update_data["completed_at"] = datetime.now(timezone.utc)
        elif status == StepStatus.IN_PROGRESS:
            update_data["started_at"] = datetime.now(timezone.utc)
            
        await self.steps_collection.update_one(
            {"_id": ObjectId(step_id)},
            {"$set": update_data}
        )
        return await self.steps_collection.find_one({"_id": ObjectId(step_id)})
