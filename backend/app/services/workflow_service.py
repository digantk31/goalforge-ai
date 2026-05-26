import asyncio
import json
from app.engine.planner import WorkflowPlanner
from app.engine.executor import StepExecutor
from app.engine.evaluator import ResultEvaluator
from app.engine.context import ExecutionContext
from app.db.repositories.workflow_repo import WorkflowRepository
from app.models.workflow import StepStatus
from motor.motor_asyncio import AsyncIOMotorDatabase

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
        await workflow_events[goal_id].put({"type": "WORKFLOW_STARTED", "data": "Starting..."})

        # 2. Plan the workflow steps
        print(f"Planning steps for goal: {goal_description}")
        steps = self.planner.plan_workflow(goal_description)
        
        db_steps = await repo.create_steps(run_id, [s.model_dump() for s in steps])

        # 3. Initialize execution context
        context = ExecutionContext(goal_id=goal_id, run_id=run_id)

        # 4. Execute and evaluate each step
        for i, step in enumerate(steps):
            db_step = db_steps[i]
            step_id = str(db_step["_id"])
            step_title = getattr(step, 'title', 'Unknown Step')
            print(f"Executing step: {step_title}")
            
            # Update DB and emit event
            await repo.update_step_status(step_id, StepStatus.IN_PROGRESS)
            await workflow_events[goal_id].put({"type": "STEP_STARTED", "data": step_title})
            
            # Execute
            result = await self.executor.execute_step(step, context)
            
            # Evaluate
            evaluation = self.evaluator.evaluate(step, result)
            
            if evaluation.get("passed"):
                status = StepStatus.COMPLETED
                # Add to context history for subsequent steps
                context.add_result(step_title, result)
                await repo.update_step_status(step_id, status, result)
                await workflow_events[goal_id].put({"type": "STEP_COMPLETED", "data": step_title})
            else:
                status = StepStatus.FAILED
                print(f"Step '{step_title}' failed with confidence {evaluation.get('confidence')}")
                await repo.update_step_status(step_id, status, result)
                await workflow_events[goal_id].put({"type": "STEP_FAILED", "data": step_title})
                break # Stop workflow on failure
            
            # Dummy delay to simulate execution time
            await asyncio.sleep(1)
            
        print("Workflow execution finished.")
        await workflow_events[goal_id].put({"type": "WORKFLOW_COMPLETED", "data": "Finished"})
        await workflow_events[goal_id].put(None) # Close the queue
        
        return run_id
