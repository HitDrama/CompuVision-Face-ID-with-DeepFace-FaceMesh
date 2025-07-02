from flask_wtf import FlaskForm
from wtforms import StringField,PasswordField,SubmitField
from wtforms.validators import  DataRequired, Length, Email, ValidationError
from models.chat_model import Acckhachhang

class RegisterForm(FlaskForm):
    fullname = StringField('Họ và tên', validators=[DataRequired(message='Họ và tên là bắt buộc'), Length(min=2, max=100, message='Họ và tên phải từ 2 đến 100 ký tự')], render_kw={'class': 'form-control'})
    email = StringField('Email', validators=[DataRequired(message='Email là bắt buộc'), Email(message='Email không hợp lệ'), Length(max=100, message='Email không được vượt quá 100 ký tự')], render_kw={'class': 'form-control'})
    password = PasswordField('Mật khẩu', validators=[DataRequired(message='Mật khẩu là bắt buộc'), Length(min=6, max=100, message='Mật khẩu phải từ 6 đến 100 ký tự')], render_kw={'class': 'form-control'})
    submit = SubmitField('Submit', render_kw={'class': 'btn btn-primary'})

    def validate_email(self, email):
        if Acckhachhang.query.filter_by(email=email.data).first():
            raise ValidationError('Email này đã được sử dụng.')


class LoginForm(FlaskForm):
    email = StringField('Email', validators=[
        DataRequired(message='Email là bắt buộc'),
        Email(message='Email không hợp lệ'),
        Length(max=100)
    ], render_kw={'class': 'form-control'})

    password = PasswordField('Mật khẩu', validators=[
        DataRequired(message='Mật khẩu là bắt buộc'),
        Length(min=6, max=100)
    ], render_kw={'class': 'form-control'})

    submit = SubmitField('Đăng nhập', render_kw={'class': 'btn btn-primary'})
