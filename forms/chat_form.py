from flask_wtf import FlaskForm
from wtforms import StringField, SelectField, BooleanField, PasswordField,TextAreaField , FloatField
from wtforms.validators import DataRequired, Length, Email

class WebsiteForm(FlaskForm):
    title = StringField('Tiêu đề website', validators=[DataRequired(), Length(max=200)])
    theme = SelectField('Chủ đề thiết kế', choices=[
        ('select', 'Chọn'),
        ('modern', 'Hiện đại'),
        ('minimal', 'Tối giản'),
        ('vibrant', 'Sôi động'),
        ('dark', 'Tối màu')
    ], default='select')
    home_page = BooleanField('Trang Chủ', default=True)
    about_page = BooleanField('Giới Thiệu', default=False)
    intro_page = BooleanField('Giới Thiệu Tổng Quan', default=False)
    product_page = BooleanField('Sản Phẩm', default=False)



class LoginForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Mật khẩu', validators=[DataRequired()])

class RegisterForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Mật khẩu', validators=[DataRequired(), Length(min=6)])
    # role = SelectField('Vai trò', choices=[('user', 'Người dùng'), ('admin', 'Quản trị viên')], default='user')

class ProductForm(FlaskForm):
    name = StringField('Tên sản phẩm', validators=[DataRequired(), Length(max=100)])
    description = TextAreaField('Mô tả', validators=[DataRequired()])
    image_url = StringField('URL hình ảnh', validators=[Length(max=500)])
    price = FloatField('Giá', validators=[DataRequired()])


