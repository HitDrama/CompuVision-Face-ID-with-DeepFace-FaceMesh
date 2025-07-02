from flask import render_template, request, redirect, url_for, flash, session,jsonify
from config import Config
from models.chat_model import db, Acckhachhang
from forms.acc_form import RegisterForm,LoginForm
import requests
import json

#đăng ký
import bcrypt
def acc_register():
    form = RegisterForm()
    if request.method == 'POST' and form.validate_on_submit():
        hashed_pw = bcrypt.hashpw(form.password.data.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        user = Acckhachhang()
        user.fullname = form.fullname.data
        user.email = form.email.data
        user.password = hashed_pw
        user.avatar = None
        user.active = True

        db.session.add(user)
        db.session.commit()

        session['user_id'] = user.id
        session['previous_url'] = url_for('acckhachhang.acc_verify')
        return redirect(url_for("acckhachhang.acc_verify"))
    return render_template('acc-register.html', form=form)




#xác thực
def acc_verify():
    if not session.get('user_id'):
        form = LoginForm()
        return render_template('acc-login.html', form=form, error='Bạn cần đăng nhập')
    return render_template('acc-face.html')




#đăng nhập
def acc_login():
    form = LoginForm()
    if form.validate_on_submit():
        user = Acckhachhang.query.filter_by(email=form.email.data).first()
        if not user:
            form.email.errors.append('Email hoặc mật khẩu không đúng')
        elif not user.check_password(form.password.data):
            form.email.errors.append('Email hoặc mật khẩu không đúng')
        elif not user.active:
            form.email.errors.append('Tài khoản bị khóa')
        else:
            session['user_id'] = user.id
            session['previous_url'] = url_for('acckhachhang.acc_verify')
            return redirect(url_for("acckhachhang.acc_verify"))
    return render_template('acc-login.html', form=form)




import base64
import tempfile
import os
from io import BytesIO
from PIL import Image
from deepface import DeepFace

# Lấy người dùng hiện tại từ session
def get_current_user():
    user_id = session.get('user_id')
    return Acckhachhang.query.get(user_id) if user_id else None

# Kiểm tra ảnh base64 có hợp lệ không
def validate_base64_image(b64_str):
    try:
        img_data = base64.b64decode(b64_str)
        Image.open(BytesIO(img_data)).verify()
        return True
    except Exception as e:
        print(f"Invalid base64 image: {e}")
        return False

# Chuyển base64 ảnh sang file tạm để xử lý bằng DeepFace
def base64_to_tempfile(b64_str):
    img_data = base64.b64decode(b64_str)
    with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp_file:
        tmp_file.write(img_data)
        return tmp_file.name

# So sánh hai ảnh base64 bằng DeepFace
def compare_embeddings(img1_b64, img2_b64):
    try:
        # Bỏ phần header nếu có (data:image/jpeg;base64,...)
        img1_b64 = img1_b64.split(",")[-1]
        img2_b64 = img2_b64.split(",")[-1]

        if not all(map(validate_base64_image, [img1_b64, img2_b64])):
            print("Invalid base64 in input")
            return False

        # Tạo file tạm
        path1, path2 = base64_to_tempfile(img1_b64), base64_to_tempfile(img2_b64)

        # So sánh bằng DeepFace
        result = DeepFace.verify(
            img1_path=path2, img2_path=path1,
            model_name='Facenet', detector_backend='mediapipe',
            enforce_detection=False
        )

        return result.get('verified', False)
    except Exception as e:
        print(f"Compare error: {e}")
        return False
    finally:
        for p in [locals().get('path1'), locals().get('path2')]:
            if p and os.path.exists(p): os.remove(p)

# Cập nhật ảnh khuôn mặt người dùng hoặc xác thực
def update_face():
    if not session.get('user_id'):
        return jsonify({'status': 'error', 'message': 'Bạn cần đăng nhập'}), 401
    if session.get('processing_image'):
        return jsonify({'status': 'error', 'message': 'Đang xử lý ảnh trước đó'}), 429

    try:
        data = request.get_json()
        hinh_avatar = data.get('image')
        if not hinh_avatar:
            return jsonify({'status': 'error', 'message': 'Dữ liệu không hợp lệ'}), 400

        session['processing_image'] = True
        user = get_current_user()

        if not user:
            return jsonify({'status': 'error', 'message': 'Không tìm thấy người dùng'}), 404

        # Nếu chưa có ảnh → lưu ảnh mới
        if not user.avatar:
            user.avatar = hinh_avatar
            db.session.commit()
            msg = 'Lưu ảnh khuôn mặt thành công'
            status = 'success'
        # Nếu đã có ảnh → xác thực khuôn mặt
        elif compare_embeddings(user.avatar, hinh_avatar):
            session['face_verified'] = True
            session['face_failed_attempts'] = 0
            msg = 'Xác thực thành công'
            status = 'success'
        else:
            return jsonify({'status': 'error', 'message': 'Xác thực thất bại', 'verified': False}), 400

        previous_url = session.pop('previous_url', '/acc-profile')
        return jsonify({'status': status, 'message': msg, 'verified': True, 'previous_url': previous_url})

    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Lỗi hệ thống: {e}'}), 500

    finally:
        session['processing_image'] = False



def profile():
    if not session.get('user_id'):
        return redirect(url_for('acckhachhang.acc_login'))

    if not session.get('face_verified'):
        session['previous_url'] = url_for('acckhachhang.profile')
        return redirect(url_for('acckhachhang.acc_verify'))

    return "ok"
