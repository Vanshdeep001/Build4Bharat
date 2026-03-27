STRINGS = {
    "en": {
        "welcome": "Welcome to Farmer Support System! 🌾\nPlease select your language:\n1. English\n2. Hindi",
        "menu": "Main Menu:\n1. Register Complaint\n2. Track Complaint Status\n3. Government Schemes Info\n4. Change Language",
        "ask_complaint": "Please describe your complaint in detail.",
        "complaint_success": "Your complaint has been registered. Your Complaint ID is: {id}",
        "ask_id": "Please enter your 6-character Complaint ID to track status.",
        "status_info": "Complaint ID: {id}\nStatus: {status}\nMessage: {message}",
        "not_found": "No complaint found with ID: {id}",
        "schemes": "Government Schemes for Farmers:\n- PM-KISAN: Direct income support of Rs. 6000/year.\n- PM Fasal Bima Yojana: Crop insurance at low premium.\n- Soil Health Card: Analyze your soil health.\nReply with '0' to go back to Menu.",
        "invalid": "Invalid input. Please choose a valid option.",
        "language_changed": "Language changed to English."
    },
    "hi": {
        "welcome": "किसान सहायता प्रणाली में आपका स्वागत है! 🌾\nकृपया अपनी भाषा चुनें:\n1. English\n2. Hindi",
        "menu": "मुख्य मेनू:\n1. शिकायत दर्ज करें\n2. शिकायत की स्थिति ट्रैक करें\n3. सरकारी योजनाओं की जानकारी\n4. भाषा बदलें",
        "ask_complaint": "कृपया अपनी शिकायत का विस्तार से वर्णन करें।",
        "complaint_success": "आपकी शिकायत दर्ज कर ली गई है। आपकी शिकायत आईडी है: {id}",
        "ask_id": "स्थिति ट्रैक करने के लिए कृपया अपनी 6 अंकों की शिकायत आईडी दर्ज करें।",
        "status_info": "शिकायत आईडी: {id}\nस्थिति: {status}\nसंदेश: {message}",
        "not_found": "आईडी {id} के साथ कोई शिकायत नहीं मिली।",
        "schemes": "किसानों के लिए सरकारी योजनाएं:\n- पीएम-किसान: 6000 रुपये/वर्ष की प्रत्यक्ष आय सहायता।\n- पीएम फसल बीमा योजना: कम प्रीमियम पर फसल बीमा।\n- मृदा स्वास्थ्य कार्ड: अपने मिट्टी के स्वास्थ्य का विश्लेषण करें।\nमेनू पर वापस जाने के लिए '0' के साथ उत्तर दें।",
        "invalid": "अमान्य इनपुट। कृपया एक वैध विकल्प चुनें।",
        "language_changed": "भाषा बदलकर हिंदी कर दी गई है।"
    }
}

def get_response(user, incoming_msg):
    phone = user["phone"]
    lang = user.get("language") or "en" # Default to EN during language selection
    step = user.get("lastStep")
    
    text = incoming_msg.strip()
    response = ""
    next_step = step
    next_lang = lang

    if step == "SELECT_LANGUAGE":
        if text == "1":
            next_lang = "en"
            next_step = "MAIN_MENU"
            response = STRINGS[next_lang]["language_changed"] + "\n\n" + STRINGS[next_lang]["menu"]
        elif text == "2":
            next_lang = "hi"
            next_step = "MAIN_MENU"
            response = STRINGS[next_lang]["language_changed"] + "\n\n" + STRINGS[next_lang]["menu"]
        else:
            response = STRINGS["en"]["welcome"] # Use English if language not set
            
    elif step == "MAIN_MENU":
        if text == "1":
            next_step = "REGISTER_COMPLAINT"
            response = STRINGS[lang]["ask_complaint"]
        elif text == "2":
            next_step = "TRACK_COMPLAINT"
            response = STRINGS[lang]["ask_id"]
        elif text == "3":
            next_step = "GOV_SCHEMES"
            response = STRINGS[lang]["schemes"]
        elif text == "4":
            next_step = "SELECT_LANGUAGE"
            response = STRINGS[lang]["welcome"]
        else:
            response = STRINGS[lang]["invalid"] + "\n\n" + STRINGS[lang]["menu"]

    elif step == "REGISTER_COMPLAINT":
        from database import create_complaint
        complaint_id = create_complaint(phone, text)
        response = STRINGS[lang]["complaint_success"].format(id=complaint_id) + "\n\n" + STRINGS[lang]["menu"]
        next_step = "MAIN_MENU"

    elif step == "TRACK_COMPLAINT":
        from database import get_complaint
        complaint = get_complaint(text)
        if complaint:
            response = STRINGS[lang]["status_info"].format(
                id=complaint["complaintId"],
                status=complaint["status"],
                message=complaint["message"]
            )
        else:
            response = STRINGS[lang]["not_found"].format(id=text)
        response += "\n\n" + STRINGS[lang]["menu"]
        next_step = "MAIN_MENU"

    elif step == "GOV_SCHEMES":
        if text == "0":
            next_step = "MAIN_MENU"
            response = STRINGS[lang]["menu"]
        else:
            response = STRINGS[lang]["schemes"]

    return response, next_step, next_lang
