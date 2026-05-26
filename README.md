# GoalForge AI

![GoalForge Cover](https://via.placeholder.com/1200x600/09090b/8b5cf6?text=GoalForge+AI)

**GoalForge AI** is a futuristic autonomous AI workflow platform built for the **Google Cloud Rapid Agent Hackathon**. Give the platform a high-level goal, and the Gemini-powered engine will autonomously break it down into actionable steps, execute them in real-time, and stream the progress back to a stunning, Vercel-inspired dashboard.

## 🚀 Features
- **Autonomous Reasoning Engine**: Powered by Google Gemini, capable of complex multi-step planning and self-correction.
- **Live SSE Telemetry**: Real-time server-sent events stream the execution state and hacker-style logs directly to your browser.
- **Premium SaaS Visuals**: A breathtaking dark-mode interface built with React, Framer Motion, and Tailwind CSS v4, featuring spotlight hover tracking and animated scanning lasers.
- **Scalable Architecture**: A clean, modular FastAPI backend backed by Async MongoDB (Motor).

## 🛠 Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS v4, Framer Motion, Zustand
- **Backend**: Python 3.11+, FastAPI, Motor (MongoDB), `google-genai`
- **Deployment**: Docker, Vercel (Frontend), Google Cloud Run (Backend)

---

## 💻 Local Development Setup

First, clone the repository and navigate into the directory:
```bash
git clone https://github.com/digantk31/goalforge-ai.git
cd goalforge-ai
```

### Option 1: Using Docker Compose (Recommended)
The easiest way to boot the entire stack (Frontend, Backend, and MongoDB) locally.

1. Copy the template env file and add your `GEMINI_API_KEY`:
   ```bash
   cp .env.example .env
   ```
3. Boot the stack:
   ```bash
   docker-compose up --build
   ```
4. Access the frontend at `http://localhost:80` and the API at `http://localhost:8000`.

### Option 2: Native Setup
If you prefer running services natively for faster hot-reloading:

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
# Ensure MONGODB_URI and GEMINI_API_KEY are set in your environment
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Manual Testing

Once the backend is running, you can manually trigger an AI workflow and stream the execution logs directly to your terminal without needing the frontend.

1. **Create a Goal**
   ```bash
   curl -X POST "http://localhost:8000/api/v1/goals" \
        -H "Content-Type: application/json" \
        -d '{"description": "Write a 5-step strategy for launching a new AI product", "priority": "high"}'
   ```
   *Take note of the `id` returned in the response (e.g., `65f...`).*

2. **Trigger the Workflow**
   ```bash
   curl -X POST "http://localhost:8000/api/v1/workflows/<INSERT_ID>"
   ```

3. **Stream the Execution (SSE)**
   ```bash
   curl -N -H "Accept: text/event-stream" "http://localhost:8000/api/v1/workflows/<INSERT_ID>/stream"
   ```
   *Watch as Gemini autonomously plans and executes the goal, streaming the logs live into your terminal!*

---

## ☁️ Production Deployment

### Frontend (Vercel)
The frontend is optimized for deployment on Vercel as a Single Page Application (SPA).
1. Connect your GitHub repository to Vercel.
2. The `vercel.json` file handles the React Router SPA redirects automatically.
3. Ensure you set the `VITE_API_BASE_URL` environment variable in Vercel to point to your Cloud Run backend.

### Backend (Google Cloud Run)
The backend is packaged specifically for Google Cloud Run using Cloud Build.
1. Authenticate with gcloud:
   ```bash
   gcloud auth login
   ```
2. Submit the build and deploy pipeline:
   ```bash
   gcloud builds submit --config cloudbuild.yaml .
   ```
3. Set your `MONGODB_URI` (e.g., MongoDB Atlas) and `GEMINI_API_KEY` in the Google Cloud Run secrets manager.

---
*Built with 💜 for the Google Cloud Rapid Agent Hackathon.*