from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"message": "GoalForge AI Backend Running"}