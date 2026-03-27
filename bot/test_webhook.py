import requests

# Test the local Flask server
URL = "http://127.0.0.1:5000/whatsapp"

def send_msg(phone, body):
    data = {
        "From": f"whatsapp:{phone}",
        "Body": body
    }
    response = requests.post(URL, data=data)
    print(f"User: {body}")
    print(f"Bot: {response.text}\n")

if __name__ == "__main__":
    print("--- Simulating Bot Interaction ---\n")
    # Step 1: Start
    send_msg("+1234567890", "hi")
    
    # Step 2: Select Language (1 for English)
    send_msg("+1234567890", "1")
    
    # Step 3: Select Register Complaint (1)
    send_msg("+1234567890", "1")
    
    # Step 4: Send Complaint Message
    send_msg("+1234567890", "There is a problem with my seeds.")
    
    print("--- Simulation Complete ---")
