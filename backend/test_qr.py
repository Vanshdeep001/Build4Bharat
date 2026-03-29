import httpx

def main():
    try:
        r = httpx.get('http://localhost:8000/api/verify/qr-data/test_sub_abc', timeout=10.0)
        print("Status Code:", r.status_code)
        if r.status_code == 200:
            data = r.json()
            print("Response Keys:", list(data.keys()))
            print("Verification URL:", data.get('verification_url'))
            print("QR Base64 length:", len(data.get('qr_base64', '')))
        else:
            print("Error details:", r.text)
    except Exception as e:
        print("Failed to connect or test:", e)

if __name__ == '__main__':
    main()
