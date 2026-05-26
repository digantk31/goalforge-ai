from fastapi import APIRouter
from app.api.v1 import goals, workflows

api_router = APIRouter()
api_router.include_router(goals.router, prefix="/goals", tags=["goals"])
api_router.include_router(workflows.router, prefix="/workflows", tags=["workflows"])
