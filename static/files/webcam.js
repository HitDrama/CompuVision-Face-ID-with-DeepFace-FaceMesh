const video = document.getElementById('video');
const overlay = document.getElementById('overlay');
const context = overlay.getContext('2d');
const statusMessage = document.getElementById('statusMessage');
const actionText = document.getElementById('actionText');
const errorMsg = document.getElementById('errorMsg');
let faceDetected = false;
let faceInOval = false;
let actionCompleted = false;
let actionConfirmed = false;
let currentAction = null;
const allActions = ['blink', 'lookUp', 'lookDown', 'tiltLeft', 'tiltRight']; // Danh sách tất cả hành động
let actions = []; // Danh sách hành động được chọn ngẫu nhiên (3/5)
let completedActions = []; // Lưu trữ các hành động đã hoàn thành
let actionIndex = 0;
const EAR_THRESHOLD = 0.25; // Ngưỡng nháy mắt
const LOOK_UP_THRESHOLD = 0.2; // Ngưỡng nhìn lên
const LOOK_DOWN_THRESHOLD = 0.2; // Ngưỡng nhìn xuống
const tiltThreshold = 0.2; // Ngưỡng nghiêng đầu
let blinkCount = 0;
const requiredBlinks = 2; // Yêu cầu nháy mắt 2 lần

// Hàm lấy hành động tiếp theo theo thứ tự
function getNextAction() {
    if (actionIndex >= actions.length) return null;
    return actions[actionIndex];
}

// Hàm random 3/5 hành động
function getRandomActions() {
    const shuffled = allActions.sort(() => 0.5 - Math.random()); // Xáo trộn mảng
    return shuffled.slice(0, 3); // Chọn 3 hành động đầu tiên
}

async function initCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        video.srcObject = stream;
        video.onloadedmetadata = () => {
            overlay.width = video.videoWidth;
            overlay.height = video.videoHeight;
            drawOverlay();
            startFaceDetection();
        };
    } catch (err) {
        console.error('Lỗi khi truy cập camera:', err);
        errorMsg.textContent = 'Không thể truy cập camera';
        errorMsg.style.display = 'block';
    }
}


function drawOverlay() {
    const width = overlay.width;
    const height = overlay.height;
    context.clearRect(0, 0, width, height);
    // Vẽ hình oval đứt nét
    const ellipseWidth = width * 0.6;
    const ellipseHeight = height * 0.8;
    const centerX = width / 2;
    const centerY = height / 2;
    context.beginPath();
    context.setLineDash([10, 5]); // Đường đứt nét
    context.ellipse(centerX, centerY, ellipseWidth / 2, ellipseHeight / 2, 0, 0, 2 * Math.PI);
    context.strokeStyle = faceInOval ? '#00ff00' : '#ff0000';
    context.lineWidth = 3;
    context.stroke();
    context.setLineDash([]); // Reset lại đường nét liền
    updateUI();
}

function updateUI() {
    if (faceDetected) {
        if (faceInOval) {
            errorMsg.style.display = 'none';
            statusMessage.style.display = 'block';
            if (!actionCompleted) {
                actionText.textContent = `Hành động ${completedActions.length + 1}/3: ${getActionDescription(currentAction)}`;
            } else {
                if (completedActions.length < actions.length) {
                    actionText.textContent = 'Đã xác nhận hành động! Chuẩn bị cho hành động tiếp theo...';
                } else {
                    actionText.textContent = 'Nhìn thẳng và giữ nguyên khuôn mặt trong 5-15 giây!';
                }
            }
        } else {
            statusMessage.style.display = 'none';
            errorMsg.style.display = 'block';
            errorMsg.textContent = 'Vui lòng đặt khuôn mặt vào giữa khung hình';
        }
    } else {
        statusMessage.style.display = 'none';
        errorMsg.style.display = 'block';
        errorMsg.textContent = 'Không phát hiện khuôn mặt';
    }
}

function getActionDescription(action) {
    const descriptions = {
        blink: 'Nháy mắt',
        lookUp: 'Nhìn lên',
        lookDown: 'Nhìn xuống',
        tiltLeft: 'Nghiêng đầu sang trái',
        tiltRight: 'Nghiêng đầu sang phải'
    };
    return descriptions[action] || 'Vui lòng đặt khuôn mặt vào khung oval';
}

function isFaceInOval(landmarks) {
    const width = overlay.width;
    const height = overlay.height;
    const ellipseWidth = width * 0.6;
    const ellipseHeight = height * 0.8;
    const centerX = width / 2;
    const centerY = height / 2;
    return landmarks.every(landmark => {
        const x = landmark.x * width;
        const y = landmark.y * height;
        const normalizedX = (x - centerX) / (ellipseWidth / 2);
        const normalizedY = (y - centerY) / (ellipseHeight / 2);
        return (normalizedX * normalizedX + normalizedY * normalizedY) <= 1;
    });
}

function checkAction(landmarks) {
    const actionsMap = {
        blink: () => detectBlink(landmarks),
        lookUp: () => detectLookUp(landmarks),
        lookDown: () => detectLookDown(landmarks),
        tiltLeft: () => detectTilt(landmarks, 'left'),
        tiltRight: () => detectTilt(landmarks, 'right')
    };

    // Nếu hành động được phát hiện
    if (actionsMap[currentAction]?.()) {
        if (!actionConfirmed) {
            actionConfirmed = true;
            actionText.textContent = `Xác nhận lại hành động ${completedActions.length + 1}/3: ${getActionDescription(currentAction)}`;
        } else if (!actionCompleted) {
            actionCompleted = true;

            // Thông báo trước khi chuyển bước
            actionText.textContent = `Đã xác nhận hành động ${completedActions.length + 1}/3: ${getActionDescription(currentAction)}. Đang chuyển bước...`;

            // Đợi 1 giây rồi mới thực hiện nextAction
            setTimeout(() => {
                completedActions.push(currentAction);
                nextAction();
            }, 1000);
        }
    }
}


function detectBlink(landmarks) {
    const leftEye = [33, 160, 158, 133, 153, 144];
    const rightEye = [362, 385, 387, 263, 373, 380];
    const leftEAR = calculateEAR(landmarks, leftEye);
    const rightEAR = calculateEAR(landmarks, rightEye);
    if (leftEAR < EAR_THRESHOLD && rightEAR < EAR_THRESHOLD) {
        blinkCount++;
        if (blinkCount >= requiredBlinks) {
            blinkCount = 0;
            return true;
        }
    }
    return false;
}

function calculateEAR(landmarks, eyeIndices) {
    const [p1, p2, p3, p4, p5, p6] = eyeIndices.map(i => landmarks[i]);
    const A = distance(p2, p6);
    const B = distance(p3, p5);
    const C = distance(p1, p4);
    return (A + B) / (2.0 * C);
}

function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

function detectLookUp(landmarks) {
    const noseTip = 1;
    const forehead = 10; // Điểm mốc trên trán
    const noseToForehead = Math.abs(landmarks[noseTip].y - landmarks[forehead].y);
    return noseToForehead < LOOK_UP_THRESHOLD;
}

function detectLookDown(landmarks) {
    const noseTip = 1;
    const chin = 152; // Điểm mốc trên cằm
    const noseToChin = Math.abs(landmarks[noseTip].y - landmarks[chin].y);
    return noseToChin > LOOK_DOWN_THRESHOLD;
}

function detectTilt(landmarks, direction) {
    const noseTip = 1;
    const leftEar = 234;
    const rightEar = 454;
    const noseToLeftEar = Math.abs(landmarks[noseTip].x - landmarks[leftEar].x);
    const noseToRightEar = Math.abs(landmarks[noseTip].x - landmarks[rightEar].x);
    const tiltRatio = noseToLeftEar / noseToRightEar;
    if (direction === 'left') {
        return tiltRatio < (1 - tiltThreshold);
    } else if (direction === 'right') {
        return tiltRatio > (1 + tiltThreshold);
    }
    return false;
}

function nextAction() {
    if (completedActions.length < actions.length) {
        actionIndex++;
        currentAction = getNextAction();
        if (currentAction === null) {
            console.error('Đã hoàn thành tất cả các hành động');
            return;
        }
        actionCompleted = false;
        actionConfirmed = false;
        setTimeout(() => {
            actionText.textContent = `Hành động ${completedActions.length + 1}/3: ${getActionDescription(currentAction)}`;
        }, 1000);
    } else {
        actionText.textContent = 'Nhìn thẳng và giữ nguyên khuôn mặt trong 5-15 giây';
        setTimeout(() => {
            startStabilityCheck(2); // Bắt đầu kiểm tra độ ổn định trong 10 giây
        }, 1000);
    }
}

function startStabilityCheck(seconds) {
    let remainingTime = seconds;
    const countdownElement = document.getElementById('countdown'); // Lấy phần tử đếm ngược
    const countdownInterval = setInterval(() => {
        if (faceInOval) {
            // Hiển thị thời gian còn lại
            countdownElement.textContent = `Đang xác thực khuôn mặt (${remainingTime} giây)...`;
            remainingTime--;
            if (remainingTime < 0) {
                clearInterval(countdownInterval); // Dừng đếm ngược
                countdownElement.textContent = ''; // Xóa thông báo đếm ngược
                autoCaptureImage(); // Chụp hình khi đếm ngược kết thúc
            }
        } else {
            clearInterval(countdownInterval); // Dừng đếm ngược nếu khuôn mặt di chuyển
            countdownElement.textContent = ''; // Xóa thông báo đếm ngược
            errorMsg.textContent = 'Khuôn mặt di chuyển! Vui lòng giữ nguyên khuôn mặt.';
            errorMsg.style.display = 'block';
            setTimeout(() => {
                startStabilityCheck(seconds); // Thử lại từ đầu
            }, 1000);
        }
    }, 1000);
}

function autoCaptureImage() {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg');
    sendImageToServer(imageData);
}


// Khởi tạo
function initializeVerification() {
    actions = getRandomActions(); // Random 3/5 hành động
    actionIndex = 0;
    currentAction = getNextAction();
    completedActions = [];
    actionText.textContent = `Hành động 1/3: ${getActionDescription(currentAction)}`;
}

initCamera();
initializeVerification();