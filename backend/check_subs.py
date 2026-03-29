import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def main():
    c = AsyncIOMotorClient("mongodb+srv://pmddky:HwN6KyIM5Ax91zvn@cluster0.qrg68hl.mongodb.net/pmddky?retryWrites=true&w=majority")
    db = c.pmddky
    
    subs = await db.submissions.find({}, {"farmer_name":1, "status":1, "task_status":1, "agent_id":1, "completion_percentage":1}).to_list(100)
    print(f"Total submissions: {len(subs)}")
    
    completed = [s for s in subs if s.get("status") == "completed"]
    none_status = [s for s in subs if s.get("status") is None]
    other = [s for s in subs if s.get("status") not in ("completed", None)]
    
    print(f"status='completed': {len(completed)}")
    print(f"status=None: {len(none_status)}")
    print(f"status=other: {len(other)}")
    
    print("\n--- ALL SUBMISSIONS ---")
    for s in subs:
        print(f"  {s.get('farmer_name','?'):20s} | status={str(s.get('status')):15s} | task_status={str(s.get('task_status')):15s} | comp={s.get('completion_percentage')}")
    
    # Check agent doc
    agent = await db.field_agents.find_one({"name": "Pooja Bisht"})
    if agent:
        print(f"\nAgent Pooja Bisht: assigned={agent.get('assigned_tasks')}, completed={agent.get('completed_tasks')}, pending={agent.get('pending_tasks')}")
    
    c.close()

asyncio.run(main())
