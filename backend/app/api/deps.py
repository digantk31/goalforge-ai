from fastapi import Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.db.mongodb import get_database
from app.db.repositories.goal_repo import GoalRepository
from app.services.goal_service import GoalService

def get_db() -> AsyncIOMotorDatabase:
    """Dependency to get MongoDB database instance."""
    return get_database()

def get_goal_repo(db: AsyncIOMotorDatabase = Depends(get_db)) -> GoalRepository:
    return GoalRepository(db)

def get_goal_service(repo: GoalRepository = Depends(get_goal_repo)) -> GoalService:
    return GoalService(repo)
