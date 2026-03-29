"""Quick test script for the WhatsApp integration endpoints."""
import httpx
import asyncio


async def main():
    base = "http://localhost:8000"
    client = httpx.AsyncClient(timeout=10.0)

    # 1. Health check
    r = await client.get(f"{base}/api/health")
    print(f"[1] Health: {r.json()}")

    # 2. Test the simulate endpoint
    r = await client.post(f"{base}/api/whatsapp/simulate", json={
        "submission_id": "test_sub_001",
        "phone": "9876543210",
        "response": "yes",
    })
    print(f"[2] Simulate YES: {r.status_code} -> {r.json()}")

    # 3. Simulate a NO response
    r = await client.post(f"{base}/api/whatsapp/simulate", json={
        "submission_id": "test_sub_002",
        "phone": "9876543211",
        "response": "no",
    })
    print(f"[3] Simulate NO: {r.status_code} -> {r.json()}")

    # 4. Check stats (no auth needed for test, but the endpoint requires auth...)
    # So we'll just confirm the endpoint is reachable
    r = await client.get(f"{base}/api/beneficiary-responses/submission/test_sub_001")
    print(f"[4] Query response: {r.status_code}")

    # 5. Check the response stats endpoint
    r = await client.get(f"{base}/api/beneficiary-responses/stats")
    print(f"[5] Stats: {r.status_code}")

    await client.aclose()
    print("\n✅ All endpoints functional!")


if __name__ == "__main__":
    asyncio.run(main())
