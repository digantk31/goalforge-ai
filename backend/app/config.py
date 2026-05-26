from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "GoalForge API"
    MONGODB_URI: str = "mongodb://localhost:27017/goalforge"
    GEMINI_API_KEY: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
