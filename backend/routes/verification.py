"""
Beneficiary Verification via QR Code
=====================================
Flow:
  1. Agent submits → unique verification token created
  2. QR code generated pointing to verification page
  3. Farmer scans QR → sees bilingual Yes/No page
  4. Farmer taps Yes or No → response stored in DB
"""

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import HTMLResponse, Response
from database import get_db
from datetime import datetime, timezone
from bson import ObjectId
import secrets
import qrcode
import io
import base64
import socket

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

router = APIRouter(prefix="/api/verify", tags=["verification-qr"])


# ── Generate QR Code for a submission ──────────────────────────
@router.get("/qr/{submission_id}")
async def get_verification_qr(submission_id: str, request: Request):
    """
    Generate a QR code image for a submission's verification link.
    Returns a PNG image of the QR code.
    """
    db = get_db()

    # Check if a verification token already exists for this submission
    existing = await db.beneficiary_responses.find_one({"submission_id": submission_id})

    if existing and existing.get("verification_token"):
        token = existing["verification_token"]
    else:
        # Create a new verification token
        token = secrets.token_urlsafe(16)

        # Get submission details
        try:
            submission = await db.submissions.find_one({"_id": ObjectId(submission_id)})
        except Exception:
            submission = None

        farmer_name = submission.get("farmer_name", "Beneficiary") if submission else "Beneficiary"
        farmer_id = submission.get("farmer_id") if submission else None

        # Look up farmer phone
        farmer_phone = ""
        if farmer_id:
            try:
                farmer_doc = await db.farmers.find_one({"_id": ObjectId(farmer_id)}, {"phone": 1})
                farmer_phone = farmer_doc.get("phone", "") if farmer_doc else ""
            except Exception:
                pass

        # Upsert the verification record
        await db.beneficiary_responses.update_one(
            {"submission_id": submission_id},
            {
                "$set": {
                    "verification_token": token,
                },
                "$setOnInsert": {
                    "submission_id": submission_id,
                    "farmer_id": farmer_id,
                    "farmer_name": farmer_name,
                    "farmer_phone": farmer_phone,
                    "response": None,
                    "created_at": datetime.now(timezone.utc),
                    "responded_at": None,
                }
            },
            upsert=True,
        )

    # Build the verification URL
    base_url = str(request.base_url).rstrip("/")
    if "localhost" in base_url or "127.0.0.1" in base_url:
        base_url = base_url.replace("localhost", get_local_ip()).replace("127.0.0.1", get_local_ip())
    verify_url = f"{base_url}/api/verify/page/{token}"

    # Generate QR code
    qr = qrcode.QRCode(version=1, box_size=10, border=2)
    qr.add_data(verify_url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#1a1a2e", back_color="white")

    # Convert to PNG bytes
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)

    return Response(content=buf.getvalue(), media_type="image/png")


# ── Get QR as base64 (for embedding in frontend) ──────────────
@router.get("/qr-data/{submission_id}")
async def get_verification_qr_data(submission_id: str, request: Request):
    """
    Returns QR code as base64 string + verification URL.
    Useful for embedding in frontend / dashboard.
    """
    db = get_db()

    existing = await db.beneficiary_responses.find_one({"submission_id": submission_id})

    if existing and existing.get("verification_token"):
        token = existing["verification_token"]
    else:
        token = secrets.token_urlsafe(16)

        try:
            submission = await db.submissions.find_one({"_id": ObjectId(submission_id)})
        except Exception:
            submission = None

        farmer_name = submission.get("farmer_name", "Beneficiary") if submission else "Beneficiary"
        farmer_id = submission.get("farmer_id") if submission else None

        await db.beneficiary_responses.update_one(
            {"submission_id": submission_id},
            {
                "$set": {
                    "verification_token": token,
                },
                "$setOnInsert": {
                    "submission_id": submission_id,
                    "farmer_id": farmer_id,
                    "farmer_name": farmer_name,
                    "response": None,
                    "created_at": datetime.now(timezone.utc),
                    "responded_at": None,
                }
            },
            upsert=True,
        )

    base_url = str(request.base_url).rstrip("/")
    if "localhost" in base_url or "127.0.0.1" in base_url:
        base_url = base_url.replace("localhost", get_local_ip()).replace("127.0.0.1", get_local_ip())
    verify_url = f"{base_url}/api/verify/page/{token}"

    # Generate QR
    qr = qrcode.QRCode(version=1, box_size=8, border=2)
    qr.add_data(verify_url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#1a1a2e", back_color="white")

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    qr_base64 = base64.b64encode(buf.getvalue()).decode()

    # Check if already responded
    response_status = None
    if existing and existing.get("response"):
        response_status = existing["response"]

    return {
        "submission_id": submission_id,
        "verification_url": verify_url,
        "qr_base64": f"data:image/png;base64,{qr_base64}",
        "token": token,
        "response": response_status,
    }


# ── Verification Page (public, no auth) ──────────────────────
@router.get("/page/{token}", response_class=HTMLResponse)
async def verification_page(token: str):
    """
    The page the farmer sees after scanning the QR code.
    Bilingual (English + Hindi) with big Yes/No buttons.
    """
    db = get_db()
    record = await db.beneficiary_responses.find_one({"verification_token": token})

    if not record:
        return HTMLResponse(content=_error_page("Invalid or expired link / अमान्य लिंक"), status_code=404)

    # Already responded?
    if record.get("response"):
        return HTMLResponse(content=_already_responded_page(record["response"], record.get("farmer_name", "")))

    farmer_name = record.get("farmer_name", "Beneficiary")
    return HTMLResponse(content=_verification_html(token, farmer_name))


# ── Submit Response (public, no auth) ─────────────────────────
@router.post("/respond/{token}")
async def submit_response(token: str, request: Request):
    """Farmer submits their Yes/No response."""
    db = get_db()
    body = await request.json()
    response_val = body.get("response", "").lower()

    if response_val not in ("yes", "no"):
        raise HTTPException(status_code=400, detail="Invalid response")

    record = await db.beneficiary_responses.find_one({"verification_token": token})
    if not record:
        raise HTTPException(status_code=404, detail="Invalid token")

    if record.get("response"):
        return {"status": "already_responded", "response": record["response"]}

    now = datetime.now(timezone.utc)

    # Update the beneficiary response
    await db.beneficiary_responses.update_one(
        {"verification_token": token},
        {"$set": {
            "response": response_val,
            "responded_at": now,
        }}
    )

    # Also tag the submission
    submission_id = record.get("submission_id")
    if submission_id:
        try:
            await db.submissions.update_one(
                {"_id": ObjectId(submission_id)},
                {"$set": {
                    "beneficiary_confirmed": response_val,
                    "beneficiary_responded_at": now,
                }}
            )
            
            # Immediately flag an anomaly if the beneficiary denied receipt
            if response_val == "no":
                submission = await db.submissions.find_one({"_id": ObjectId(submission_id)})
                if submission:
                    block_id = submission.get("block_id", "unknown_block")
                    district_id = submission.get("district_id", "dehradun")
                    agent_id = submission.get("agent_id")
                    farmer_name = record.get("farmer_name", "Unknown Beneficiary")
                    
                    agent = await db.field_agents.find_one({"_id": ObjectId(agent_id)}) if agent_id and len(str(agent_id)) == 24 else None
                    agent_name = agent.get("name", "Unknown Agent") if agent else "Unknown Agent"
                    
                    from services.anomaly_engine import _create_anomaly
                    explanation = f"Fraud Alert: Beneficiary {farmer_name} explicitly denied receiving the benefits claimed in field report by agent {agent_name}."
                    
                    await _create_anomaly(
                        db, 
                        district_id, 
                        block_id, 
                        "beneficiary_dispute", 
                        100, 
                        explanation
                    )
                    
        except Exception as e:
            print(f"Error updating submission / triggering anomaly: {e}")

    return {"status": "ok", "response": response_val}


# ── HTML Templates ────────────────────────────────────────────

def _verification_html(token: str, farmer_name: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PMDDKY - Beneficiary Verification</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

        * {{ margin: 0; padding: 0; box-sizing: border-box; }}

        body {{
            font-family: 'Inter', sans-serif;
            min-height: 100vh;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            color: #f1f5f9;
        }}

        .card {{
            background: rgba(30, 41, 59, 0.8);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(99, 102, 241, 0.2);
            border-radius: 24px;
            padding: 40px 32px;
            max-width: 420px;
            width: 100%;
            text-align: center;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
        }}

        .logo {{
            font-size: 14px;
            font-weight: 600;
            color: #818cf8;
            letter-spacing: 2px;
            text-transform: uppercase;
            margin-bottom: 8px;
        }}

        .emblem {{ font-size: 48px; margin-bottom: 16px; }}

        h1 {{
            font-size: 20px;
            font-weight: 700;
            color: #e2e8f0;
            margin-bottom: 8px;
        }}

        .farmer-name {{
            font-size: 18px;
            font-weight: 600;
            color: #a5b4fc;
            margin-bottom: 24px;
        }}

        .question {{
            font-size: 16px;
            line-height: 1.6;
            color: #cbd5e1;
            margin-bottom: 12px;
            padding: 16px;
            background: rgba(99, 102, 241, 0.08);
            border-radius: 12px;
            border: 1px solid rgba(99, 102, 241, 0.12);
        }}

        .hindi {{ color: #94a3b8; font-size: 15px; margin-top: 8px; }}

        .buttons {{
            display: flex;
            gap: 16px;
            margin-top: 32px;
        }}

        .btn {{
            flex: 1;
            padding: 18px 24px;
            border: none;
            border-radius: 16px;
            font-size: 18px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s ease;
            font-family: 'Inter', sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
        }}

        .btn-yes {{
            background: linear-gradient(135deg, #059669, #10b981);
            color: white;
            box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
        }}

        .btn-yes:hover {{ transform: translateY(-2px); box-shadow: 0 12px 32px rgba(16, 185, 129, 0.4); }}
        .btn-yes:active {{ transform: scale(0.97); }}

        .btn-no {{
            background: linear-gradient(135deg, #dc2626, #ef4444);
            color: white;
            box-shadow: 0 8px 24px rgba(239, 68, 68, 0.3);
        }}

        .btn-no:hover {{ transform: translateY(-2px); box-shadow: 0 12px 32px rgba(239, 68, 68, 0.4); }}
        .btn-no:active {{ transform: scale(0.97); }}

        .btn-sub {{ font-size: 13px; font-weight: 400; opacity: 0.9; }}

        .footer {{
            margin-top: 24px;
            font-size: 11px;
            color: #64748b;
        }}

        /* Result states */
        .result {{ display: none; }}
        .result.show {{ display: block; }}
        .result-icon {{ font-size: 64px; margin-bottom: 16px; }}
        .result-text {{ font-size: 18px; line-height: 1.6; }}

        .spinner {{
            display: none;
            width: 40px; height: 40px;
            border: 4px solid rgba(255,255,255,0.1);
            border-top-color: #818cf8;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin: 24px auto;
        }}
        @keyframes spin {{ to {{ transform: rotate(360deg); }} }}
    </style>
</head>
<body>
    <div class="card">
        <!-- Question State -->
        <div id="questionState">
            <div class="logo">PMDDKY GroundTruth</div>
            <div class="emblem">🏛️</div>
            <h1>Beneficiary Verification</h1>
            <div class="farmer-name">{farmer_name}</div>

            <div class="question">
                Have you received the benefits from the recent government scheme visit?
                <div class="hindi">
                    क्या आपको हाल की सरकारी योजना यात्रा से लाभ प्राप्त हुआ है?
                </div>
            </div>

            <div class="buttons">
                <button class="btn btn-yes" onclick="respond('yes')">
                    Yes ✅
                    <span class="btn-sub">हाँ</span>
                </button>
                <button class="btn btn-no" onclick="respond('no')">
                    No ❌
                    <span class="btn-sub">नहीं</span>
                </button>
            </div>

            <div class="spinner" id="spinner"></div>
        </div>

        <!-- Success State -->
        <div class="result" id="resultState">
            <div class="result-icon" id="resultIcon"></div>
            <div class="result-text" id="resultText"></div>
        </div>

        <div class="footer">
            Pradhan Mantri Dhan Dhaanya Krishi Yojana<br>
            प्रधानमंत्री धन धान्य कृषि योजना
        </div>
    </div>

    <script>
        async function respond(value) {{
            const btns = document.querySelectorAll('.btn');
            btns.forEach(b => b.disabled = true);
            document.getElementById('spinner').style.display = 'block';

            try {{
                const res = await fetch('/api/verify/respond/{token}', {{
                    method: 'POST',
                    headers: {{ 'Content-Type': 'application/json' }},
                    body: JSON.stringify({{ response: value }})
                }});
                const data = await res.json();

                document.getElementById('questionState').style.display = 'none';
                const resultState = document.getElementById('resultState');
                resultState.classList.add('show');

                if (value === 'yes') {{
                    document.getElementById('resultIcon').textContent = '✅';
                    document.getElementById('resultText').innerHTML =
                        'Thank you for confirming!<br>Your response has been recorded.' +
                        '<div class="hindi" style="margin-top:12px;color:#94a3b8">' +
                        'पुष्टि के लिए धन्यवाद!<br>आपका जवाब दर्ज कर लिया गया है।</div>';
                }} else {{
                    document.getElementById('resultIcon').textContent = '📝';
                    document.getElementById('resultText').innerHTML =
                        'Thank you for your response.<br>Authorities will be notified.' +
                        '<div class="hindi" style="margin-top:12px;color:#94a3b8">' +
                        'आपके जवाब के लिए धन्यवाद।<br>संबंधित अधिकारियों को सूचित किया जाएगा।</div>';
                }}
            }} catch (err) {{
                alert('Error submitting response. Please try again.');
                btns.forEach(b => b.disabled = false);
                document.getElementById('spinner').style.display = 'none';
            }}
        }}
    </script>
</body>
</html>"""


def _already_responded_page(response: str, farmer_name: str) -> str:
    icon = "✅" if response == "yes" else "📝"
    en_text = "You have already confirmed receipt of benefits." if response == "yes" else "You have already reported non-receipt."
    hi_text = "आपने पहले ही लाभ प्राप्ति की पुष्टि कर दी है।" if response == "yes" else "आपने पहले ही गैर-प्राप्ति की सूचना दे दी है।"

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PMDDKY - Already Responded</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{
            font-family: 'Inter', sans-serif;
            min-height: 100vh;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
            display: flex; align-items: center; justify-content: center;
            padding: 20px; color: #f1f5f9;
        }}
        .card {{
            background: rgba(30, 41, 59, 0.8);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(99, 102, 241, 0.2);
            border-radius: 24px;
            padding: 40px 32px; max-width: 420px; width: 100%;
            text-align: center;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
        }}
        .icon {{ font-size: 64px; margin-bottom: 16px; }}
        .name {{ color: #a5b4fc; font-size: 18px; font-weight: 600; margin-bottom: 16px; }}
        .text {{ font-size: 16px; line-height: 1.6; color: #cbd5e1; }}
        .hindi {{ color: #94a3b8; font-size: 15px; margin-top: 12px; }}
        .footer {{ margin-top: 24px; font-size: 11px; color: #64748b; }}
    </style>
</head>
<body>
    <div class="card">
        <div class="icon">{icon}</div>
        <div class="name">{farmer_name}</div>
        <div class="text">
            {en_text}
            <div class="hindi">{hi_text}</div>
        </div>
        <div class="footer">PMDDKY GroundTruth Platform</div>
    </div>
</body>
</html>"""


def _error_page(message: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PMDDKY - Error</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{
            font-family: 'Inter', sans-serif;
            min-height: 100vh;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
            display: flex; align-items: center; justify-content: center;
            padding: 20px; color: #f1f5f9;
        }}
        .card {{
            background: rgba(30, 41, 59, 0.8);
            border-radius: 24px; padding: 40px 32px;
            max-width: 420px; width: 100%; text-align: center;
        }}
        .icon {{ font-size: 64px; margin-bottom: 16px; }}
        .text {{ font-size: 16px; color: #ef4444; }}
    </style>
</head>
<body>
    <div class="card">
        <div class="icon">⚠️</div>
        <div class="text">{message}</div>
    </div>
</body>
</html>"""
