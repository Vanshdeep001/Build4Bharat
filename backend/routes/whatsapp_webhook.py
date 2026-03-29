"""
WhatsApp Webhook — receives button responses from beneficiaries
and stores them in the database.

Two endpoints:
  GET  /api/whatsapp/webhook  — Meta verification challenge
  POST /api/whatsapp/webhook  — Incoming message/button response
  POST /api/whatsapp/simulate — Manual test endpoint (mock mode)
"""

from fastapi import APIRouter, Request, HTTPException, Query
from database import get_db
from datetime import datetime, timezone
from config import settings

router = APIRouter(prefix="/api/whatsapp", tags=["whatsapp"])


# ── Webhook Verification (Meta requires this) ─────────────────
@router.get("/webhook")
async def verify_webhook(
    hub_mode: str = Query(None, alias="hub.mode"),
    hub_verify_token: str = Query(None, alias="hub.verify_token"),
    hub_challenge: str = Query(None, alias="hub.challenge"),
):
    """
    Meta sends a GET request to verify the webhook URL.
    We must respond with the hub.challenge if the token matches.
    """
    if hub_mode == "subscribe" and hub_verify_token == settings.WHATSAPP_VERIFY_TOKEN:
        print(f"✅ WhatsApp webhook verified")
        return int(hub_challenge)
    raise HTTPException(status_code=403, detail="Verification failed")


# ── Webhook Receiver (Incoming Messages) ──────────────────────
@router.post("/webhook")
async def receive_webhook(request: Request):
    """
    Receives incoming WhatsApp messages.
    We look for interactive button replies that contain our submission_id.
    """
    body = await request.json()
    db = get_db()

    try:
        # Navigate the WhatsApp webhook payload structure
        entry = body.get("entry", [])
        for e in entry:
            changes = e.get("changes", [])
            for change in changes:
                value = change.get("value", {})
                messages = value.get("messages", [])

                for msg in messages:
                    msg_type = msg.get("type")
                    from_phone = msg.get("from", "")
                    msg_id = msg.get("id", "")

                    if msg_type == "interactive":
                        interactive = msg.get("interactive", {})
                        button_reply = interactive.get("button_reply", {})
                        button_id = button_reply.get("id", "")
                        # button_id format: "yes_{submission_id}" or "no_{submission_id}"

                        if button_id.startswith("yes_") or button_id.startswith("no_"):
                            response_val = "yes" if button_id.startswith("yes_") else "no"
                            submission_id = button_id.split("_", 1)[1]

                            await _store_response(
                                db, submission_id, from_phone, response_val, msg_id
                            )

                            # Send thank-you message
                            try:
                                from services.whatsapp_service import send_thank_you
                                await send_thank_you(from_phone, response_val)
                            except Exception as e:
                                print(f"Thank-you send error: {e}")

    except Exception as e:
        print(f"❌ Webhook processing error: {e}")

    # WhatsApp expects 200 always
    return {"status": "ok"}


# ── Simulation Endpoint (for testing without real WhatsApp) ───
@router.post("/simulate")
async def simulate_response(request: Request):
    """
    Manual test endpoint: simulate a beneficiary's button response.
    Usage: POST /api/whatsapp/simulate
    Body: { "submission_id": "...", "phone": "9876543210", "response": "yes" | "no" }
    """
    body = await request.json()
    submission_id = body.get("submission_id")
    phone = body.get("phone", "")
    response_val = body.get("response", "")

    if not submission_id or response_val not in ("yes", "no"):
        raise HTTPException(
            status_code=400,
            detail="Required: submission_id, response ('yes' or 'no')"
        )

    db = get_db()
    result = await _store_response(
        db, submission_id, phone, response_val, f"simulated_{submission_id}"
    )

    return {
        "status": "ok",
        "message": f"Simulated '{response_val}' response stored for submission {submission_id}",
        "record_id": result,
    }


# ── Helper: store the response ────────────────────────────────
async def _store_response(
    db, submission_id: str, phone: str, response: str, whatsapp_msg_id: str
) -> str:
    """
    Store or update the beneficiary response in DB.
    If a record already exists for this submission (from the initial send),
    update it. Otherwise, create a new record.
    """
    now = datetime.now(timezone.utc)

    # Try to update the existing record (created when message was sent)
    existing = await db.beneficiary_responses.find_one_and_update(
        {"submission_id": submission_id, "response": None},
        {
            "$set": {
                "response": response,
                "responded_at": now,
                "response_whatsapp_msg_id": whatsapp_msg_id,
                "responder_phone": phone,
            }
        },
    )

    if existing:
        record_id = str(existing["_id"])
        print(f"✅ Beneficiary response updated: {response} for submission {submission_id}")
    else:
        # No pending record found — create a new one (e.g., from simulation)
        doc = {
            "submission_id": submission_id,
            "farmer_phone": phone,
            "response": response,
            "whatsapp_message_id": whatsapp_msg_id,
            "created_at": now,
            "responded_at": now,
        }
        result = await db.beneficiary_responses.insert_one(doc)
        record_id = str(result.inserted_id)
        print(f"✅ Beneficiary response created: {response} for submission {submission_id}")

    # Also tag the submission doc with the beneficiary's response
    try:
        from bson import ObjectId
        await db.submissions.update_one(
            {"_id": ObjectId(submission_id)},
            {"$set": {
                "beneficiary_confirmed": response,
                "beneficiary_responded_at": now,
            }}
        )
    except Exception as e:
        print(f"⚠️ Could not update submission with response: {e}")

    return record_id
