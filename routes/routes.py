from flask import Blueprint





#đăng ký, đăng nhập, xác thực
from controllers.acc_controller import acc_register,acc_verify,acc_login,update_face,profile
acc_khachhang = Blueprint("acckhachhang", __name__)
acc_khachhang.route("/acc-register", methods=["GET", "POST"])(acc_register)
acc_khachhang.route("/acc-verify", methods=["GET", "POST"])(acc_verify)
acc_khachhang.route("/acc-login", methods=["GET", "POST"])(acc_login)
acc_khachhang.route("/update-face", methods=["POST"])(update_face)
acc_khachhang.route("/acc-profile", methods=["GET", "POST"])(profile)

