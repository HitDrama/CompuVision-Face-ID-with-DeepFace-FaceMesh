class Config:
    SECRET_KEY = 'your_secret_key_here'  # Replace with your actual secret key
    GOOGLE_API_KEY = '' # Replace with your actual Google API key
    GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key={GOOGLE_API_KEY}"

    SQLALCHEMY_DATABASE_URI = "mysql+pymysql://root@localhost/xacthuckhuonmat"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JSON_AS_ASCII = False
