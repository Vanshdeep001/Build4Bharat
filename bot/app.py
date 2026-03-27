import os
from flask import Flask, request
from twilio.twiml.messaging_response import MessagingResponse
from database import get_user, update_user
from logic import get_response, STRINGS

app = Flask(__name__)

@app.route("/whatsapp", methods=["POST"])
def whatsapp_webhook():
    incoming_msg = request.values.get("Body", "").strip()
    from_number = request.values.get("From", "")
    
    # Get or create user
    user = get_user(from_number)
    
    # Process message based on current state
    response_text, next_step, next_lang = get_response(user, incoming_msg)
    
    # Update user state in DB
    update_user(from_number, {"lastStep": next_step, "language": next_lang})
    
    # Create Twilio response
    resp = MessagingResponse()
    msg = resp.message()
    msg.body(response_text)
    
    return str(resp)

@app.route("/", methods=["GET"])
def health_check():
    return "Farmer Support Bot is running! 🌾", 200

if __name__ == "__main__":
    app.run(port=5000, debug=True)
