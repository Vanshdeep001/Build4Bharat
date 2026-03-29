import asyncio
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import connect_db, close_db

async def check():
    db = await connect_db()
    
    agent = await db.field_agents.find_one({"phone": "9800000001"})
    print("--- field_agents collection ---")
    if agent:
        print(f"FOUND: {agent['name']} | phone={agent['phone']} | role={agent.get('role')} | block={agent.get('block_id')}")
    else:
        print("NOT FOUND: phone 9800000001")
    
    user = await db.users.find_one({"phone": "9800000001"})
    print("\n--- users collection ---")
    if user:
        print(f"FOUND: {user['name']} | phone={user['phone']} | role={user.get('role')}")
    else:
        print("NOT FOUND: phone 9800000001")
    
    print("\n--- First 5 field agents ---")
    cursor = db.field_agents.find({}, {"name": 1, "phone": 1, "role": 1}).limit(5)
    async for a in cursor:
        print(f"  {a['phone']} - {a['name']} ({a.get('role')})")
    
    await close_db()

asyncio.run(check())
