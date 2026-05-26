from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_router
from app.config import settings
from app.db.mongodb import close_mongo_connection

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    yield
    # Shutdown
    close_mongo_connection()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API for GoalForge",
    version="0.1.0",
    lifespan=lifespan
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME}"}

