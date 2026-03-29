import asyncio
from database import connect_db

async def test():
    db = await connect_db()
    agent = await db.field_agents.find_one({"name": "Pooja Bisht"})
    
    with open("test_out.txt", "w") as f:
        f.write(f"Agent block: {agent['block_id']}\n")
        agent_id = str(agent["_id"])
        subs = await db.submissions.find({"agent_id": agent_id}).to_list(100)
        f.write(f"Subs count: {len(subs)}\n")
        
        complete_count = sum(1 for s in subs if s.get("status") == "completed")
        f.write(f"Completed subs: {complete_count}\n")
        
        farmers = await db.farmers.find({"block_id": agent["block_id"]}).to_list(100)
        f.write(f"Farmers in block: {len(farmers)}\n")

        fids_in_subs = set(s.get("farmer_id") for s in subs if s.get("status") == "completed")
        f.write(f"Completed farmer_ids in subs: {fids_in_subs}\n")

        fids_in_block = set(str(f["_id"]) for f in farmers)
        f.write(f"Overlap: {fids_in_subs.intersection(fids_in_block)}\n")

if __name__ == "__main__":
    asyncio.run(test())
