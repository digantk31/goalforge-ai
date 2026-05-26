import asyncio
import json
import logging
import traceback
from app.engine.planner import WorkflowPlanner
from app.engine.executor import StepExecutor
from app.engine.evaluator import ResultEvaluator
from app.engine.context import ExecutionContext
from app.db.repositories.workflow_repo import WorkflowRepository
from app.models.workflow import StepStatus
from motor.motor_asyncio import AsyncIOMotorDatabase

logger = logging.getLogger(__name__)

workflow_events = {}

class WorkflowService:
    """Service to manage the lifecycle of a workflow."""

    def __init__(self):
        self.planner = WorkflowPlanner()
        self.executor = StepExecutor()
        self.evaluator = ResultEvaluator()

    async def stream_workflow_events(self, run_id: str):
        queue = workflow_events.get(run_id)
        if queue is None:
            return

        while True:
            event = await queue.get()
            if event is None:
                break
            yield {"event": "message", "data": json.dumps(event)}

    async def start_workflow(self, goal_id: str, goal_description: str, db: AsyncIOMotorDatabase):
        """Starts a workflow for a given goal."""
        repo = WorkflowRepository(db)
        
        # 1. Create workflow run in DB
        workflow_run = await repo.create_workflow_run(goal_id)
        run_id = str(workflow_run["_id"])

        # Initialize event queue using goal_id so the frontend can subscribe with it
        workflow_events[goal_id] = asyncio.Queue()
        await workflow_events[goal_id].put({"log": "🚀 Starting workflow..."})

        try:
            # 2. Plan the workflow steps (run in thread pool to avoid blocking)
            await workflow_events[goal_id].put({"log": f"📋 Planning steps for: {goal_description}"})
            print(f"Planning steps for goal: {goal_description}")
            steps = await asyncio.to_thread(self.planner.plan_workflow, goal_description)
            
            if not steps:
                await workflow_events[goal_id].put({"log": "❌ Failed to generate a plan from Gemini."})
                await workflow_events[goal_id].put(None)
                return run_id

            db_steps = await repo.create_steps(run_id, [s.model_dump() for s in steps])
            await workflow_events[goal_id].put({"log": f"✅ Plan created with {len(steps)} steps."})

            # 3. Initialize execution context
            context = ExecutionContext(goal_id=goal_id, run_id=run_id)

            # 4. Execute and evaluate each step
            for i, step in enumerate(steps):
                db_step = db_steps[i]
                step_id = str(db_step["_id"])
                step_title = getattr(step, 'title', f'Step {i+1}')
                print(f"Executing step: {step_title}")
                
                # Update DB and emit running event
                await repo.update_step_status(step_id, StepStatus.IN_PROGRESS)
                await workflow_events[goal_id].put({
                    "step": step_title, "status": "running", "id": step_id,
                    "log": f"▶ Executing step {i+1}/{len(steps)}: {step_title}"
                })
                
                # Execute (async — runs Gemini call in thread pool)
                result = await self.executor.execute_step(step, context)
                
                # Evaluate (async — runs Gemini call in thread pool)
                evaluation = await self.evaluator.evaluate(step, result)
                
                if evaluation.get("passed"):
                    status = StepStatus.COMPLETED
                    context.add_result(step_title, result)
                    await repo.update_step_status(step_id, status, result)
                    await workflow_events[goal_id].put({
                        "step": step_title, "status": "completed", "id": step_id,
                        "log": f"✅ Step completed: {step_title}"
                    })
                else:
                    status = StepStatus.FAILED
                    confidence = evaluation.get('confidence', 0)
                    print(f"Step '{step_title}' failed with confidence {confidence}")
                    await repo.update_step_status(step_id, status, result)
                    await workflow_events[goal_id].put({
                        "step": step_title, "status": "failed", "id": step_id,
                        "log": f"❌ Step failed: {step_title} (confidence: {confidence})"
                    })
                    break
                
                await asyncio.sleep(0.5)
                
            # 5. Build and send final report from accumulated context
            print("Workflow execution finished.")
            if context.history:
                report_lines = ["# Workflow Results\n"]
                for item in context.history:
                    report_lines.append(f"## {item['step']}\n\n{item['result']}\n\n---\n")
                report_md = "\n".join(report_lines)
            else:
                report_md = "# Workflow Results\n\nNo steps completed successfully."

            await workflow_events[goal_id].put({
                "step": "Generate Report", "status": "completed", "id": "report",
                "log": "📄 Workflow execution finished.",
                "report": report_md
            })

        except Exception as e:
            error_msg = str(e)
            logger.error(f"Workflow failed for goal {goal_id}: {error_msg}")
            logger.error(traceback.format_exc())
            
            # Determine user-friendly message
            if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
                user_msg = "⚠️ Gemini API rate limit exceeded. Please wait a moment and try again."
            elif "403" in error_msg or "PERMISSION_DENIED" in error_msg:
                user_msg = "⚠️ Gemini API key is invalid or lacks permissions. Check your GEMINI_API_KEY."
            else:
                user_msg = f"⚠️ Workflow error: {error_msg}"

            await workflow_events[goal_id].put({"log": f"❌ {user_msg}"})

        finally:
            await workflow_events[goal_id].put(None)
        
        return run_id
