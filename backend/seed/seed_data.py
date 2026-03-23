"""
Seed script for PMDDKY GroundTruth demo data.
Run: python -m seed.seed_data
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import bcrypt
from datetime import datetime, timedelta, timezone
from database import connect_db, close_db
import random

random.seed(42)

# ── Constants ──────────────────────────────────────────────────────

DISTRICTS = [
    {"district_id": "uttarkashi", "name": "Uttarkashi"},
    {"district_id": "chamoli", "name": "Chamoli"},
]

BLOCKS = {
    "uttarkashi": [
        {"block_id": "dunda", "name": "Dunda"},
        {"block_id": "bhatwari", "name": "Bhatwari"},
        {"block_id": "purola", "name": "Purola"},
    ],
    "chamoli": [
        {"block_id": "gopeshwar", "name": "Gopeshwar"},
        {"block_id": "joshimath", "name": "Joshimath"},
        {"block_id": "karnaprayag", "name": "Karnaprayag"},
    ],
}

VILLAGES = {
    "dunda": ["Raithal", "Dyara", "Barsu", "Gangotri"],
    "bhatwari": ["Harsil", "Sukhi", "Jhala", "Dharali"],
    "purola": ["Naugaon", "Mori", "Jarmola", "Barkot"],
    "gopeshwar": ["Mandal", "Chopta", "Tungnath", "Urgam"],
    "joshimath": ["Auli", "Tapovan", "Pandukeshwar", "Govindghat"],
    "karnaprayag": ["Simli", "Nauti", "Gwaldam", "Tharali"],
}

FIRST_NAMES = [
    "Rajesh", "Suresh", "Mahesh", "Ramesh", "Dinesh",
    "Mohan", "Sohan", "Rohan", "Kiran", "Prem",
    "Deepak", "Ashok", "Vinod", "Anil", "Sunil",
    "Geeta", "Seema", "Kavita", "Sunita", "Anita",
    "Pooja", "Meena", "Rekha", "Usha", "Radha",
]

LAST_NAMES = [
    "Rawat", "Bisht", "Negi", "Panwar", "Chauhan",
    "Dobhal", "Semwal", "Bhandari", "Joshi", "Painuli",
    "Bhatt", "Sajwan", "Gusain", "Raturi", "Nautiyal",
]

ACTIVITY_TYPES = [
    "seed_distribution", "irrigation_work", "kcc_loan_camp",
    "soil_health_card", "storage_facility", "training",
]

SCHEME_NAMES = [
    "PMKSY", "Soil Health Mission", "KCC Camp", "Seed Subsidy",
    "Storage Infrastructure",
]


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def random_name():
    return f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"


def random_phone():
    return f"98{random.randint(10000000, 99999999)}"


def random_aadhaar4():
    return f"{random.randint(1000, 9999)}"


async def seed():
    db = await connect_db()

    # Clear existing data
    collections = [
        "users", "farmers", "submissions", "fund_logs",
        "farmer_verifications", "anomalies", "notifications", "districts", "blocks",
    ]
    for col in collections:
        await db[col].delete_many({})
    print("🗑️  Cleared existing data")

    # ── Districts & Blocks ─────────────────────────────────────
    for d in DISTRICTS:
        await db.districts.insert_one({
            "_id": d["district_id"],
            "name": d["name"],
            "state": "Uttarakhand",
        })
    for district_id, blocks in BLOCKS.items():
        for b in blocks:
            await db.blocks.insert_one({
                "_id": b["block_id"],
                "name": b["name"],
                "district_id": district_id,
            })
    print("✅ Districts & blocks seeded")

    # ── Users ──────────────────────────────────────────────────
    agent_phone_counter = 9800000001
    users_created = []

    # Field agents: 2 per block = 12
    for district_id, blocks in BLOCKS.items():
        for block in blocks:
            for i in range(2):
                phone = str(agent_phone_counter)
                agent_phone_counter += 1
                user_doc = {
                    "name": random_name(),
                    "phone": phone,
                    "password_hash": hash_password("agent123"),
                    "role": "field_agent",
                    "district_id": district_id,
                    "block_id": block["block_id"],
                    "created_at": datetime.now(timezone.utc),
                }
                result = await db.users.insert_one(user_doc)
                users_created.append({**user_doc, "_id": result.inserted_id})

    # District admins: 1 per district = 2
    for i, d in enumerate(DISTRICTS):
        phone = f"990000000{i + 1}"
        user_doc = {
            "name": f"Admin {d['name']}",
            "phone": phone,
            "password_hash": hash_password("admin123"),
            "role": "district_admin",
            "district_id": d["district_id"],
            "block_id": None,
            "created_at": datetime.now(timezone.utc),
        }
        result = await db.users.insert_one(user_doc)
        users_created.append({**user_doc, "_id": result.inserted_id})

    # State admin: 1
    state_admin = {
        "name": "State Coordinator",
        "phone": "9700000001",
        "password_hash": hash_password("state123"),
        "role": "state_admin",
        "district_id": None,
        "block_id": None,
        "created_at": datetime.now(timezone.utc),
    }
    await db.users.insert_one(state_admin)
    print(f"✅ {len(users_created) + 1} users seeded")

    # ── Farmers ────────────────────────────────────────────────
    farmer_ids = {}
    for district_id, blocks in BLOCKS.items():
        for block in blocks:
            bid = block["block_id"]
            farmer_ids[bid] = []
            villages = VILLAGES.get(bid, ["Default Village"])
            for j in range(20):
                farmer_doc = {
                    "name": random_name(),
                    "aadhaar_last4": random_aadhaar4(),
                    "phone": random_phone(),
                    "district_id": district_id,
                    "block_id": bid,
                    "village": villages[j % len(villages)],
                    "land_holding_acres": round(random.uniform(0.5, 5.0), 1),
                    "schemes_enrolled": random.sample(
                        ["PMKSY", "KCC", "Soil Health", "PMDDKY"], k=random.randint(1, 3)
                    ),
                    "created_at": datetime.now(timezone.utc),
                }
                result = await db.farmers.insert_one(farmer_doc)
                farmer_ids[bid].append(str(result.inserted_id))
    print("✅ 120 farmers seeded")

    # ── Submissions ────────────────────────────────────────────
    agents_by_block = {}
    for u in users_created:
        if u["role"] == "field_agent":
            bid = u["block_id"]
            if bid not in agents_by_block:
                agents_by_block[bid] = []
            agents_by_block[bid].append(str(u["_id"]))

    # Base GPS coords for blocks (approximate Uttarakhand locations)
    BLOCK_GPS = {
        "dunda": (30.75, 78.45),
        "bhatwari": (30.80, 78.60),
        "purola": (30.90, 78.10),
        "gopeshwar": (30.40, 79.30),
        "joshimath": (30.55, 79.55),
        "karnaprayag": (30.25, 79.20),
    }

    submission_ids = {}
    for district_id, blocks in BLOCKS.items():
        for block in blocks:
            bid = block["block_id"]
            submission_ids[bid] = []
            base_lat, base_lng = BLOCK_GPS.get(bid, (30.5, 79.0))
            block_agents = agents_by_block.get(bid, ["unknown"])
            block_farmers = farmer_ids.get(bid, [])

            for k in range(5):
                activity = ACTIVITY_TYPES[k % len(ACTIVITY_TYPES)]
                completion = random.uniform(30, 95)
                beneficiary_count = random.randint(10, 100)

                # Vary GPS — some with mismatch
                photo_lat = base_lat + random.uniform(-0.005, 0.005)
                photo_lng = base_lng + random.uniform(-0.005, 0.005)
                project_lat = base_lat
                project_lng = base_lng
                location_match = True
                distance_km = round(random.uniform(0.1, 0.8), 2)

                # Inject 3 location mismatches
                if bid == "dunda" and k == 0:
                    photo_lat = base_lat + 0.05  # ~5km away
                    location_match = False
                    distance_km = 5.2
                elif bid == "bhatwari" and k == 1:
                    photo_lat = base_lat + 0.03
                    location_match = False
                    distance_km = 3.1
                elif bid == "joshimath" and k == 2:
                    photo_lat = base_lat - 0.04
                    location_match = False
                    distance_km = 4.5

                created_at = datetime.now(timezone.utc) - timedelta(
                    days=random.randint(1, 30),
                    hours=random.randint(0, 12),
                )

                kpi_map = {
                    "seed_distribution": ("quintals_distributed", random.uniform(10, 50)),
                    "irrigation_work": ("hectares_covered", random.uniform(5, 30)),
                    "kcc_loan_camp": ("loans_facilitated", random.randint(5, 25)),
                    "soil_health_card": ("cards_issued", random.randint(20, 80)),
                    "storage_facility": ("capacity_tonnes", random.uniform(10, 50)),
                    "training": ("sessions_conducted", random.randint(1, 5)),
                }
                kpi_type, kpi_value = kpi_map.get(activity, ("other", 10))

                import hashlib
                agent_id = block_agents[k % len(block_agents)]
                raw = f"{agent_id}{bid}{created_at.isoformat()}"
                submission_hash = hashlib.sha256(raw.encode()).hexdigest()

                submission_doc = {
                    "agent_id": agent_id,
                    "farmer_id": block_farmers[k % len(block_farmers)] if block_farmers else None,
                    "district_id": district_id,
                    "block_id": bid,
                    "village": VILLAGES.get(bid, ["Village"])[k % len(VILLAGES.get(bid, ["Village"]))],
                    "activity_type": activity,
                    "completion_percentage": round(completion, 1),
                    "beneficiary_count": beneficiary_count,
                    "materials_used": {"seeds_kg": str(random.randint(50, 200))},
                    "photo_url": f"https://res.cloudinary.com/demo/image/upload/sample_field_{bid}_{k}.jpg",
                    "photo_gps": {"lat": photo_lat, "lng": photo_lng},
                    "project_gps": {"lat": project_lat, "lng": project_lng},
                    "location_match": location_match,
                    "location_distance_km": distance_km,
                    "submission_hash": submission_hash,
                    "kpi_value": round(kpi_value, 1) if isinstance(kpi_value, float) else kpi_value,
                    "kpi_type": kpi_type,
                    "notes": f"Field visit for {activity.replace('_', ' ')} in {VILLAGES.get(bid, ['Village'])[0]}",
                    "created_at": created_at,
                    "anomaly_score": 0,
                    "is_anomaly": False,
                }
                result = await db.submissions.insert_one(submission_doc)
                submission_ids[bid].append(str(result.inserted_id))

    print("✅ 30 submissions seeded")

    # ── Fund Logs ──────────────────────────────────────────────
    for district_id, blocks in BLOCKS.items():
        for block in blocks:
            bid = block["block_id"]
            for s in range(2):
                scheme = SCHEME_NAMES[s % len(SCHEME_NAMES)]
                released = random.uniform(500000, 2000000)
                utilised = released * random.uniform(0.3, 0.85)

                # Inject anomaly: fund far ahead in Bhatwari
                if bid == "bhatwari" and s == 0:
                    released = 1800000
                    utilised = 1700000  # 94% utilised
                    progress = 35  # only 35% progress
                elif bid == "joshimath" and s == 1:
                    released = 1500000
                    utilised = 1400000
                    progress = 40
                else:
                    progress = random.uniform(40, 85)

                fund_doc = {
                    "district_id": district_id,
                    "block_id": bid,
                    "scheme_name": scheme,
                    "amount_released": round(released, 0),
                    "amount_utilised": round(utilised, 0),
                    "vendor_name": f"Vendor {random.choice(['A', 'B', 'C', 'D'])}",
                    "physical_progress_pct": round(progress, 1),
                    "logged_by": "seed_script",
                    "created_at": datetime.now(timezone.utc) - timedelta(days=random.randint(1, 20)),
                }
                await db.fund_logs.insert_one(fund_doc)
    print("✅ 12 fund logs seeded")

    # ── Farmer Verifications ───────────────────────────────────
    # Add disputes in Dunda block to trigger high_dispute_rate
    dunda_submissions = submission_ids.get("dunda", [])
    dunda_farmers = farmer_ids.get("dunda", [])

    # 4 disputes + 2 positive = 66% dispute rate (well above 15%)
    for i in range(6):
        benefit = i >= 4  # First 4 are disputes
        verification_doc = {
            "farmer_id": dunda_farmers[i % len(dunda_farmers)] if dunda_farmers else None,
            "submission_id": dunda_submissions[i % len(dunda_submissions)] if dunda_submissions else None,
            "district_id": "uttarkashi",
            "block_id": "dunda",
            "channel": "web" if i < 3 else "ivr",
            "benefit_received": benefit,
            "quality_rating": 4 if benefit else random.randint(1, 2),
            "issue_description": None if benefit else random.choice([
                "Seeds never delivered to my village",
                "Irrigation pipes not installed as claimed",
                "No training was conducted in our area",
                "Received only half the promised materials",
            ]),
            "created_at": datetime.now(timezone.utc) - timedelta(days=random.randint(1, 15)),
        }
        await db.farmer_verifications.insert_one(verification_doc)

    # Some positive verifications in other blocks
    for bid in ["bhatwari", "purola", "gopeshwar", "joshimath", "karnaprayag"]:
        block_farmers_list = farmer_ids.get(bid, [])
        block_submissions_list = submission_ids.get(bid, [])
        district = "uttarkashi" if bid in ["bhatwari", "purola"] else "chamoli"
        for i in range(3):
            verification_doc = {
                "farmer_id": block_farmers_list[i % len(block_farmers_list)] if block_farmers_list else None,
                "submission_id": block_submissions_list[i % len(block_submissions_list)] if block_submissions_list else None,
                "district_id": district,
                "block_id": bid,
                "channel": "web",
                "benefit_received": True,
                "quality_rating": random.randint(3, 5),
                "issue_description": None,
                "created_at": datetime.now(timezone.utc) - timedelta(days=random.randint(1, 20)),
            }
            await db.farmer_verifications.insert_one(verification_doc)

    print("✅ Farmer verifications seeded")

    # ── Pre-built Anomalies ────────────────────────────────────
    anomalies = [
        {
            "district_id": "uttarkashi",
            "block_id": "dunda",
            "anomaly_type": "high_dispute_rate",
            "anomaly_score": 82,
            "explanation": (
                "In Dunda (Uttarkashi), 67% of farmer verifications report that benefits were not received, "
                "which far exceeds the 15% threshold and signals serious ground-level discrepancies in scheme delivery. "
                "Deploy an independent verification team to Dunda within 48 hours and cross-verify "
                "all agent submissions against farmer testimonies."
            ),
            "suggested_action": "Deploy independent verification team within 48 hours",
            "status": "open",
            "created_at": datetime.now(timezone.utc) - timedelta(days=2),
        },
        {
            "district_id": "uttarkashi",
            "block_id": "bhatwari",
            "anomaly_type": "fund_ahead_of_progress",
            "anomaly_score": 74,
            "explanation": (
                "In Bhatwari (Uttarkashi), fund utilisation stands at 94% while physical progress is only at 35%, "
                "creating a 59-percentage-point gap that strongly suggests funds are being released without "
                "corresponding on-ground work completion. "
                "Immediately freeze further fund releases for Bhatwari block and conduct a joint physical "
                "verification with independent observers."
            ),
            "suggested_action": "Freeze fund releases and schedule physical verification",
            "status": "open",
            "created_at": datetime.now(timezone.utc) - timedelta(days=3),
        },
        {
            "district_id": "chamoli",
            "block_id": "joshimath",
            "anomaly_type": "cost_outlier",
            "anomaly_score": 68,
            "explanation": (
                "In Joshimath (Chamoli), the cost per beneficiary is ₹6,200, which is significantly higher "
                "than the district average of ₹2,800, indicating possible vendor overcharging or inflated "
                "beneficiary counts. "
                "Audit the vendor contracts for Joshimath block and verify actual material delivery "
                "quantities against billed amounts."
            ),
            "suggested_action": "Audit vendor contracts and verify material delivery",
            "status": "open",
            "created_at": datetime.now(timezone.utc) - timedelta(days=1),
        },
    ]

    for anomaly in anomalies:
        await db.anomalies.insert_one(anomaly)
    print("✅ 3 pre-built anomalies seeded")

    # ── Notifications ──────────────────────────────────────────
    notifications = [
        {
            "district_id": "uttarkashi",
            "type": "anomaly_alert",
            "message": "New high dispute rate anomaly detected in Dunda (Score: 82)",
            "read": False,
            "created_at": datetime.now(timezone.utc) - timedelta(days=2),
        },
        {
            "district_id": "uttarkashi",
            "type": "anomaly_alert",
            "message": "Fund ahead of progress anomaly in Bhatwari (Score: 74)",
            "read": False,
            "created_at": datetime.now(timezone.utc) - timedelta(days=3),
        },
        {
            "district_id": "chamoli",
            "type": "anomaly_alert",
            "message": "Cost outlier detected in Joshimath (Score: 68)",
            "read": False,
            "created_at": datetime.now(timezone.utc) - timedelta(days=1),
        },
        {
            "district_id": "uttarkashi",
            "type": "kpi_at_risk",
            "message": "KPI 'Micro-irrigation coverage' is at risk — projected to reach only 61% of target by year end",
            "read": False,
            "created_at": datetime.now(timezone.utc) - timedelta(hours=12),
        },
    ]
    for n in notifications:
        await db.notifications.insert_one(n)
    print("✅ Notifications seeded")

    print("\n🎉 Seed complete! Demo credentials:")
    print("─" * 45)
    print("Field Agents:  9800000001-9800000012 / agent123")
    print("District Admin: 9900000001, 9900000002 / admin123")
    print("State Admin:   9700000001 / state123")

    await close_db()


if __name__ == "__main__":
    asyncio.run(seed())
