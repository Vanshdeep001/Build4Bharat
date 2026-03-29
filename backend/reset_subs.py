import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def main():
    c = AsyncIOMotorClient("mongodb+srv://pmddky:HwN6KyIM5Ax91zvn@cluster0.qrg68hl.mongodb.net/pmddky?retryWrites=true&w=majority")
    db = c.pmddky
    
    # 1. Delete ALL submissions
    result = await db.submissions.delete_many({})
    print(f"Deleted {result.deleted_count} submissions")
    
    # 2. Reset all field agent counters
    result2 = await db.field_agents.update_many(
        {},
        {"$set": {"completed_tasks": 0, "pending_tasks": 10}}
    )
    print(f"Reset {result2.modified_count} agent counters (completed=0, pending=10)")
    
    # 3. Verify
    agents = await db.field_agents.find({}, {"name":1, "assigned_tasks":1, "completed_tasks":1, "pending_tasks":1}).to_list(10)
    for a in agents:
        print(f"  {a.get('name')}: assigned={a.get('assigned_tasks')}, completed={a.get('completed_tasks')}, pending={a.get('pending_tasks')}")
    
    subs_count = await db.submissions.count_documents({})
    print(f"\nSubmissions remaining: {subs_count}")
    
    c.close()
    print("\nDone! All farmers are now pending.")

asyncio.run(main())
