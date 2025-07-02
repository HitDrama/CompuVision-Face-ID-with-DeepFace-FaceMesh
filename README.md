# CompuVision-Face-ID-with-DeepFace-FaceMesh

<!-- Poster Image -->
<img src="https://github.com/HitDrama/CompuVision-Face-ID-with-DeepFace-FaceMesh/blob/main/static/imgs/sinhtrachoc.png" alt="CompuVision Poster" style="width:100%; max-width:800px; display:block; margin:auto;" />

🔒 **CompuVision** là hệ thống xác thực sinh trắc học khuôn mặt thời gian thực, được phát triển và triển khai tại [mycode.edu.vn](https://mycode.edu.vn), nhằm đảm bảo mỗi học sinh chỉ sử dụng tài khoản của chính mình khi truy cập khóa học.


## 🎯 Mục tiêu dự án

- Xác thực học sinh dựa trên khuôn mặt để **ngăn chặn việc chia sẻ tài khoản**.
- Ứng dụng các công nghệ AI trong thị giác máy tính:
  - 🧠 **[DeepFace](https://github.com/serengil/deepface)** – Nhận diện và xác thực khuôn mặt bằng deep learning.
  - 🧩 **[Google FaceMesh](https://developers.google.com/mediapipe/solutions/vision/face_mesh)** – Dò 468 điểm trên khuôn mặt, giúp kiểm tra vị trí và hành vi khuôn mặt.

## Demo
<!-- Link with embedded demo image -->
<p align="center">
  <a href="demo.gif" target="_blank">
    <img src="https://github.com/HitDrama/CompuVision-Face-ID-with-DeepFace-FaceMesh/blob/main/static/imgs/test.gif" alt="Click to view full demo" style="width:100%; max-width:800px;" />
    
   <em>📝 Click vào ảnh trên hoặc commit bên dưới để xem chi tiết quá trình xác thực.</em>
  </a>
</p>

---

## ⚙️ Hướng dẫn cài đặt

### 1. Clone dự án

```bash
git clone https://github.com/yourusername/CompuVision-Face-ID-with-DeepFace-FaceMesh.git
cd CompuVision-Face-ID-with-DeepFace-FaceMesh
```

### 2. Cài đặt thư viện phụ thuộc
```bash
pip install -r requirements.txt
```

### 3. Cấu hình hệ thống
Cập nhật file cấu hình (ví dụ config.py):
```python
class Config:
    SECRET_KEY = 'your_secret_key_here'  # Replace with your actual secret key

    SQLALCHEMY_DATABASE_URI = "mysql+pymysql://root@localhost/xacthuckhuonmat"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JSON_AS_ASCII = False
```
### 4. Chạy ứng dụng

## ✨ Tính năng chính
✅ Xác thực người dùng bằng khuôn mặt

✅ Kiểm tra hành vi: nhìn trái/phải/lên/xuống, nháy mắt, giữ thẳng mặt

✅ Hạn chế học hộ, bảo mật tài khoản học tập

✅ Tương thích camera trực tiếp (webcam, camera rời)

## 🧰 Công nghệ sử dụng
- Python + Flask

- DeepFace (Face Recognition)

- Google MediaPipe FaceMesh

- MySQL

- Bootstrap / TailwindCSS (Frontend)

## 👨‍💻 Build by: Dev Dang To Nhan
  
