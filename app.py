from config import Config
from routes.routes import  acc_khachhang
from flask import Flask
from models.chat_model import db
from flask_wtf.csrf import CSRFProtect

app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)
csrf = CSRFProtect(app)

# Đăng ký route

app.register_blueprint( acc_khachhang)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
        
