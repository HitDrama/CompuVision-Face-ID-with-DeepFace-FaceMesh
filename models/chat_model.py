# models/chat_model.py
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import bcrypt
import uuid

db = SQLAlchemy()

    

class Acckhachhang(db.Model):
    __tablename__ = 'Acckhachhang'

    id = db.Column(db.Integer, primary_key=True)
    fullname = db.Column(db.String(100), nullable=True)
    avatar = db.Column(db.Text, nullable=True)
    email = db.Column(db.String(100), nullable=False, unique=True)
    password = db.Column(db.String(200), nullable=False)
    active = db.Column(db.Boolean, default=True)
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))

    def check_password(self, password_plaintext):
        return bcrypt.checkpw(password_plaintext.encode('utf-8'), self.password.encode('utf-8'))
