# GoalForge AI

Autonomous multi-step AI workflow agent powered by Gemini and Google Cloud.

Built for the Google Cloud Rapid Agent Hackathon.

---

# Frontend Setup

## Create Frontend

```bash
npm create vite@latest frontend -- --template react-ts
```

Choose:

```bash
React
TypeScript
```

---

## Install Frontend Dependencies

```bash
cd frontend
npm install
```

Install additional packages:

```bash
npm install tailwindcss @tailwindcss/vite framer-motion lucide-react react-router-dom axios recharts zustand
```

Install ShadCN UI:

```bash
npm install -D shadcn-ui
```

---

## Run Frontend

```bash
npm run dev
```

Open:

```bash
http://localhost:5173
```

If the Vite page opens successfully:

```bash
✅ Frontend working
```

---

# Backend Setup

Open a new terminal.

Go back to the project root:

```bash
cd ..
```

Create backend folder:

```bash
mkdir backend
```

Move into backend folder:

```bash
cd backend
```

---

## Create Virtual Environment

```bash
python -m venv venv
```

Activate the environment:

### Windows

```bash
venv\Scripts\activate
```

### Mac/Linux

```bash
source venv/bin/activate
```

---

## Install Backend Dependencies

```bash
pip install fastapi uvicorn pymongo python-dotenv google-genai motor pydantic
```

---

## Create Backend Entry File

Create:

```bash
main.py
```

Paste:

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"message": "GoalForge AI Backend Running"}
```

---

## Run Backend

```bash
uvicorn main:app --reload
```

Open:

```bash
http://127.0.0.1:8000
```

You should see:

```json
{"message":"GoalForge AI Backend Running"}
```

---

# Setup Complete

You now have:

- ✅ React Frontend
- ✅ FastAPI Backend
- ✅ MongoDB Ready
- ✅ Gemini AI Ready
- ✅ Full-stack Environment Ready