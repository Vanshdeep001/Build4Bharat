from config import settings

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None


def generate_anomaly_explanation(anomaly_data: dict) -> str:
    """Generate a plain-language explanation of an anomaly using OpenAI.
    Falls back to template if API key not configured."""

    if not settings.OPENAI_API_KEY or OpenAI is None:
        return _fallback_explanation(anomaly_data)

    try:
        client = OpenAI(api_key=settings.OPENAI_API_KEY)

        prompt = f"""You are a government programme audit assistant for PMDDKY \
(Pradhan Mantri Dhan-Dhaanya Krishi Yojana) in Uttarakhand.

A field submission has been flagged as anomalous.

Anomaly type: {anomaly_data.get('type', 'unknown')}
Block: {anomaly_data.get('block_name', 'Unknown')}, District: {anomaly_data.get('district_name', 'Unknown')}
Fund utilisation: {anomaly_data.get('fund_pct', 0)}%
Physical progress: {anomaly_data.get('progress_pct', 0)}%
Farmer dispute rate: {anomaly_data.get('dispute_rate', 0)}%
Cost per beneficiary: ₹{anomaly_data.get('cost_per_beneficiary', 0)}
District average cost: ₹{anomaly_data.get('peer_avg_cost', 2800)}
Days since last field visit: {anomaly_data.get('days_inactive', 0)}

Write exactly 2 sentences in plain English for a District Collector to read:
Sentence 1: What is wrong and why it is suspicious.
Sentence 2: What specific action should be taken immediately.

Do not use jargon. Do not use bullet points.
Return only the 2 sentences, nothing else."""

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=150,
            temperature=0.3,
        )
        return response.choices[0].message.content.strip()

    except Exception as e:
        print(f"OpenAI API error: {e}")
        return _fallback_explanation(anomaly_data)


def _fallback_explanation(anomaly_data: dict) -> str:
    """Template-based fallback when OpenAI is unavailable."""
    atype = anomaly_data.get("type", "unknown")
    block = anomaly_data.get("block_name", "Unknown Block")
    district = anomaly_data.get("district_name", "Unknown District")

    templates = {
        "fund_ahead_of_progress": (
            f"In {block} ({district}), fund utilisation at {anomaly_data.get('fund_pct', 0)}% "
            f"is significantly ahead of physical progress at {anomaly_data.get('progress_pct', 0)}%, "
            f"suggesting possible fund misuse or inflated billing. "
            f"Immediately freeze further fund releases for this block and schedule a physical verification visit."
        ),
        "high_dispute_rate": (
            f"In {block} ({district}), {anomaly_data.get('dispute_rate', 0)}% of farmer verifications "
            f"report that benefits were not received, which is above the 15% threshold and indicates "
            f"significant ground-level discrepancies. "
            f"Deploy an independent verification team to this block within 48 hours and cross-verify "
            f"agent submissions against farmer testimony."
        ),
        "cost_outlier": (
            f"In {block} ({district}), the cost per beneficiary at ₹{anomaly_data.get('cost_per_beneficiary', 0)} "
            f"is significantly higher than the district average of ₹{anomaly_data.get('peer_avg_cost', 2800)}, "
            f"indicating possible vendor overcharging or inflated beneficiary counts. "
            f"Audit the vendor contracts for this block and verify actual material delivery quantities."
        ),
        "inactivity_gap": (
            f"In {block} ({district}), there has been no field submission for "
            f"{anomaly_data.get('days_inactive', 0)} days, which suggests either agent absenteeism "
            f"or data reporting stoppage. "
            f"Contact the assigned field agents immediately and consider reassigning personnel if inactivity persists."
        ),
        "location_mismatch": (
            f"In {block} ({district}), a submission photo's GPS location does not match the registered "
            f"project site, raising concerns about fabricated field visits. "
            f"Verify the agent's recent submissions and cross-check with physical site conditions."
        ),
    }

    return templates.get(atype, f"An anomaly of type '{atype}' was detected in {block} ({district}). "
                                f"Please review the associated data and take appropriate action.")
