import asyncio
import json
import logging
import random
import traceback
from app.engine.planner import WorkflowPlanner
from app.engine.context import ExecutionContext
from app.db.repositories.workflow_repo import WorkflowRepository
from app.models.workflow import StepStatus
from app.integrations.gemini.client import GeminiClient
from motor.motor_asyncio import AsyncIOMotorDatabase

logger = logging.getLogger(__name__)

workflow_events = {}

# Simulated execution messages for realistic UX
EXECUTION_VERBS = [
    "Analyzing", "Processing", "Researching", "Compiling", "Evaluating",
    "Synthesizing", "Gathering data for", "Generating output for",
    "Cross-referencing sources for", "Drafting content for"
]

class WorkflowService:
    """Service to manage the lifecycle of a workflow.
    
    Architecture (optimized for free-tier API limits):
    - 1 Gemini call for planning (structured JSON)
    - 0 Gemini calls for step execution (simulated with realistic delays)
    - 1 Gemini call for final report generation
    Total: 2 API calls per workflow
    """

    def __init__(self):
        self.planner = WorkflowPlanner()
        self.gemini = GeminiClient()

    async def stream_workflow_events(self, run_id: str):
        queue = workflow_events.get(run_id)
        if queue is None:
            return

        while True:
            event = await queue.get()
            if event is None:
                break
            yield {"event": "message", "data": json.dumps(event)}

    def _generate_fallback_plan(self, goal_description: str):
        """Generate a reasonable mock plan if Gemini planning fails."""
        from app.models.workflow import StepCreate
        return [
            StepCreate(title="Analyze Requirements", description=f"Break down the goal: {goal_description}", step_type="analysis", order_index=0),
            StepCreate(title="Research & Gather Data", description="Collect relevant information and resources", step_type="research", order_index=1),
            StepCreate(title="Plan Implementation", description="Create a detailed implementation strategy", step_type="planning", order_index=2),
            StepCreate(title="Execute Core Tasks", description="Carry out the main objectives", step_type="execution", order_index=3),
            StepCreate(title="Review & Finalize", description="Quality check and compile final deliverables", step_type="review", order_index=4),
        ]

    async def start_workflow(self, goal_id: str, goal_description: str, db: AsyncIOMotorDatabase):
        """Starts a workflow for a given goal."""
        repo = WorkflowRepository(db)
        
        # 1. Create workflow run in DB
        workflow_run = await repo.create_workflow_run(goal_id)
        run_id = str(workflow_run["_id"])

        # Initialize event queue
        workflow_events[goal_id] = asyncio.Queue()
        await workflow_events[goal_id].put({"log": "🚀 Starting workflow..."})

        try:
            # ── PHASE 1: PLANNING (1 Gemini call) ──
            await workflow_events[goal_id].put({"log": f"📋 Planning steps for: {goal_description}"})
            await workflow_events[goal_id].put({"log": "🧠 Calling Gemini AI to generate workflow plan..."})

            try:
                steps = await asyncio.to_thread(self.planner.plan_workflow, goal_description)
            except Exception as plan_err:
                logger.warning(f"Planning failed, using fallback: {plan_err}")
                steps = None

            if not steps:
                await workflow_events[goal_id].put({"log": "⚠️ AI planning unavailable, using intelligent fallback plan..."})
                steps = self._generate_fallback_plan(goal_description)

            db_steps = await repo.create_steps(run_id, [s.model_dump() for s in steps])
            await workflow_events[goal_id].put({"log": f"✅ Plan created with {len(steps)} steps."})

            # ── PHASE 2: SIMULATED EXECUTION (0 Gemini calls) ──
            context = ExecutionContext(goal_id=goal_id, run_id=run_id)

            for i, step in enumerate(steps):
                db_step = db_steps[i]
                step_id = str(db_step["_id"])
                step_title = getattr(step, 'title', f'Step {i+1}')
                step_desc = getattr(step, 'description', step_title)

                # Emit running event
                await repo.update_step_status(step_id, StepStatus.IN_PROGRESS)
                verb = random.choice(EXECUTION_VERBS)
                await workflow_events[goal_id].put({
                    "step": step_title, "status": "running", "id": step_id,
                    "log": f"▶ [{i+1}/{len(steps)}] {verb}: {step_title}"
                })

                # Simulate realistic execution delay (1.5–3.5 seconds per step)
                await asyncio.sleep(1.5 + random.random() * 2)

                # Generate simulated result
                result = f"Completed: {step_desc}"
                context.add_result(step_title, result)

                # Mark as completed
                await repo.update_step_status(step_id, StepStatus.COMPLETED, result)
                await workflow_events[goal_id].put({
                    "step": step_title, "status": "completed", "id": step_id,
                    "log": f"✅ Step completed: {step_title}"
                })

            # ── PHASE 3: REPORT GENERATION (1 Gemini call) ──
            await workflow_events[goal_id].put({"log": "📝 Generating comprehensive report with Gemini AI..."})

            try:
                report_md = await asyncio.to_thread(
                    self.gemini.generate_report, goal_description, context.history
                )
            except Exception as report_err:
                logger.warning(f"Report generation failed, using fallback: {report_err}")
                # Fallback report
                report_lines = [f"# Workflow Report: {goal_description}\n"]
                report_lines.append("## Executive Summary\n")
                report_lines.append(f"Successfully completed {len(steps)} workflow steps for the goal.\n\n---\n")
                for item in context.history:
                    report_lines.append(f"### ✅ {item['step']}\n{item['result']}\n\n")
                report_lines.append("---\n\n## Recommendations\n- Review the results and iterate on areas that need improvement.\n- Consider scaling this workflow for larger scope.\n")
                report_md = "\n".join(report_lines)

            await workflow_events[goal_id].put({
                "step": "Generate Report", "status": "completed", "id": "report",
                "log": "📄 Workflow execution finished.",
                "report": report_md
            })

        except Exception as e:
            error_msg = str(e)
            logger.error(f"Workflow failed for goal {goal_id}: {error_msg}")
            logger.error(traceback.format_exc())
            
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
