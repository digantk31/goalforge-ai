from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

class MongoDBClient:
    client: AsyncIOMotorClient = None
    db_name: str = "goalforge"

db = MongoDBClient()

def get_database():
    if db.client is None:
        db.client = AsyncIOMotorClient(settings.MONGODB_URI)
    return db.client[db.db_name]

def close_mongo_connection():
    if db.client is not None:
        db.client.close()
