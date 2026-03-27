import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "farmer_support_bot")

client = MongoClient(MONGODB_URL)
db = client[DB_NAME]

users_col = db["users"]
complaints_col = db["complaints"]

def get_user(phone):
    user = users_col.find_one({"phone": phone})
    if not user:
        user = {
            "phone": phone,
            "language": None,
            "lastStep": "SELECT_LANGUAGE"
        }
        users_col.insert_one(user)
    return user

def update_user(phone, updates):
    users_col.update_one({"phone": phone}, {"$set": updates})

def create_complaint(phone, message):
    import random
    import string
    import datetime

    # Generate unique complaint ID
    complaint_id = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    
    complaint = {
        "complaintId": complaint_id,
        "phone": phone,
        "message": message,
        "status": "Pending",
        "timestamp": datetime.datetime.utcnow()
    }
    complaints_col.insert_one(complaint)
    return complaint_id

def get_complaint(complaint_id):
    return complaints_col.find_one({"complaintId": complaint_id.upper()})
