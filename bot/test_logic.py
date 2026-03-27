import unittest
from logic import get_response

class TestBotLogic(unittest.TestCase):
    def setUp(self):
        self.user_en = {"phone": "whatsapp:+1234567890", "language": "en", "lastStep": "SELECT_LANGUAGE"}
        self.user_menu = {"phone": "whatsapp:+1234567890", "language": "en", "lastStep": "MAIN_MENU"}

    def test_language_selection(self):
        response, next_step, next_lang = get_response(self.user_en, "1")
        self.assertEqual(next_lang, "en")
        self.assertEqual(next_step, "MAIN_MENU")
        self.assertIn("Main Menu", response)

    def test_menu_to_complaint(self):
        response, next_step, next_lang = get_response(self.user_menu, "1")
        self.assertEqual(next_step, "REGISTER_COMPLAINT")
        self.assertIn("describe your complaint", response)

    def test_invalid_input(self):
        response, next_step, next_lang = get_response(self.user_menu, "9")
        self.assertEqual(next_step, "MAIN_MENU")
        self.assertIn("Invalid input", response)

if __name__ == "__main__":
    unittest.main()
