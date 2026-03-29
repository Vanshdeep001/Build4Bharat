"""
WhatsApp Cloud API Service for sending interactive button messages
to beneficiaries after field agent submissions.

Supports two modes:
  - REAL mode: Uses Meta WhatsApp Cloud API (requires credentials)
  - MOCK mode: Logs messages to console (for development/demo)
"""

import httpx
from datetime import datetime, timezone
from config import settings
from database import get_db

# ── Constants ──────────────────────────────────────────────────
WHATSAPP_API_URL = "https://graph.facebook.com/v21.0"


def _is_mock_mode() -> bool:
    """Check if we should use mock mode (no real WhatsApp credentials)."""
    return not settings.WHATSAPP_ACCESS_TOKEN or settings.WHATSAPP_ACCESS_TOKEN == "mock_token"


def _format_phone(phone: str) -> str:
    """
    Format phone number for WhatsApp API.
    Assumes Indian numbers. Strips leading 0 or +91, then prepends 91.
    """
    phone = phone.strip().replace(" ", "").replace("-", "")
    if phone.startswith("+"):
        phone = phone[1:]
    if phone.startswith("91") and len(phone) == 12:
        return phone
    if phone.startswith("0"):
        phone = phone[1:]
    return f"91{phone}"


def _build_confirmation_message(farmer_name: str, submission_id: str) -> dict:
    """
    Build the WhatsApp interactive button message payload.
    Bilingual: English + Hindi.
    """
    return {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "type": "interactive",
        "interactive": {
            "type": "button",
            "header": {
                "type": "text",
                "text": "🏛️ PMDDKY - Beneficiary Confirmation"
            },
            "body": {
                "text": (
                    f"Dear *{farmer_name}*,\n\n"
                    f"Have you received the benefits from the recent government scheme visit?\n\n"
                    f"प्रिय *{farmer_name}*,\n"
                    f"क्या आपको हाल की सरकारी योजना यात्रा से लाभ प्राप्त हुआ है?\n\n"
                    f"कृपया नीचे दिए गए बटन से जवाब दें।\n"
                    f"Please tap a button below to respond."
                )
            },
            "footer": {
                "text": "PMDDKY GroundTruth Platform"
            },
            "action": {
                "buttons": [
                    {
                        "type": "reply",
                        "reply": {
                            "id": f"yes_{submission_id}",
                            "title": "Yes ✅ हाँ"
                        }
                    },
                    {
                        "type": "reply",
                        "reply": {
                            "id": f"no_{submission_id}",
                            "title": "No ❌ नहीं"
                        }
                    }
                ]
            }
        }
    }


def _build_thank_you_message(response: str) -> dict:
    """Build a simple thank-you text message after response."""
    if response == "yes":
        text = (
            "✅ Thank you for confirming! Your response has been recorded.\n\n"
            "✅ पुष्टि के लिए धन्यवाद! आपका जवाब दर्ज कर लिया गया है।"
        )
    else:
        text = (
            "📝 Thank you for your response. We have noted that you have not received the benefits. "
            "The concerned authorities will be notified.\n\n"
            "📝 आपके जवाब के लिए धन्यवाद। हमने नोट कर लिया है कि आपको लाभ प्राप्त नहीं हुआ है। "
            "संबंधित अधिकारियों को सूचित किया जाएगा।"
        )
    return {
        "messaging_product": "whatsapp",
        "type": "text",
        "text": {"body": text}
    }


async def send_beneficiary_confirmation(
    phone: str,
    farmer_name: str,
    submission_id: str,
    farmer_id: str = None,
) -> dict:
    """
    Send a WhatsApp interactive button message to the beneficiary.
    Returns the message ID and status.
    """
    formatted_phone = _format_phone(phone)
    message_payload = _build_confirmation_message(farmer_name, submission_id)
    message_payload["to"] = formatted_phone

    db = get_db()

    # Store the outgoing message record
    wa_record = {
        "submission_id": submission_id,
        "farmer_id": farmer_id,
        "farmer_name": farmer_name,
        "farmer_phone": formatted_phone,
        "message_type": "confirmation_sent",
        "response": None,  # Will be filled when farmer responds
        "whatsapp_message_id": None,
        "created_at": datetime.now(timezone.utc),
        "responded_at": None,
    }

    if _is_mock_mode():
        # ── MOCK MODE ──────────────────────────────────────────
        print(f"\n{'='*60}")
        print(f"📱 [MOCK] WhatsApp Message to: {formatted_phone}")
        print(f"   Farmer: {farmer_name}")
        print(f"   Submission: {submission_id}")
        print(f"   Message: Have you received the benefits? (Yes/No)")
        print(f"   Hindi: क्या आपको लाभ प्राप्त हुआ है? (हाँ/नहीं)")
        print(f"{'='*60}\n")

        wa_record["whatsapp_message_id"] = f"mock_msg_{submission_id}"
        wa_record["mock_mode"] = True

        await db.beneficiary_responses.insert_one(wa_record)

        return {
            "success": True,
            "mock": True,
            "message_id": f"mock_msg_{submission_id}",
            "phone": formatted_phone,
        }

    # ── REAL MODE ──────────────────────────────────────────────
    url = f"{WHATSAPP_API_URL}/{settings.WHATSAPP_PHONE_NUMBER_ID}/messages"
    headers = {
        "Authorization": f"Bearer {settings.WHATSAPP_ACCESS_TOKEN}",
        "Content-Type": "application/json",
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=message_payload, headers=headers)
            resp_data = resp.json()

            if resp.status_code == 200:
                msg_id = resp_data.get("messages", [{}])[0].get("id", "")
                wa_record["whatsapp_message_id"] = msg_id
                await db.beneficiary_responses.insert_one(wa_record)

                print(f"✅ WhatsApp sent to {formatted_phone} | msg_id={msg_id}")
                return {"success": True, "message_id": msg_id, "phone": formatted_phone}
            else:
                print(f"❌ WhatsApp API error: {resp.status_code} – {resp_data}")
                return {"success": False, "error": resp_data, "phone": formatted_phone}

    except Exception as e:
        print(f"❌ WhatsApp send failed: {e}")
        return {"success": False, "error": str(e), "phone": formatted_phone}


async def send_thank_you(phone: str, response: str) -> dict:
    """Send a thank-you message after the farmer responds."""
    formatted_phone = _format_phone(phone)
    message_payload = _build_thank_you_message(response)
    message_payload["to"] = formatted_phone

    if _is_mock_mode():
        print(f"📱 [MOCK] Thank-you sent to {formatted_phone} (response={response})")
        return {"success": True, "mock": True}

    url = f"{WHATSAPP_API_URL}/{settings.WHATSAPP_PHONE_NUMBER_ID}/messages"
    headers = {
        "Authorization": f"Bearer {settings.WHATSAPP_ACCESS_TOKEN}",
        "Content-Type": "application/json",
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=message_payload, headers=headers)
            return {"success": resp.status_code == 200}
    except Exception as e:
        print(f"❌ Thank-you send failed: {e}")
        return {"success": False, "error": str(e)}
