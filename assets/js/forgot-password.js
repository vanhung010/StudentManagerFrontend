// forgot-password.js
// Xử lý đầy đủ 3 bước gọi API đổi mật khẩu:
// 1) POST /auth/forgot-password  -> gửi OTP về email
// 2) POST /auth/verify-otp       -> xác thực mã OTP
// 3) PUT  /auth/reset-password   -> đặt mật khẩu mới

document.addEventListener('DOMContentLoaded', () => {
   
    const stepRequest = document.getElementById('stepRequest');
    const stepOtp = document.getElementById('stepOtp');
    const stepReset = document.getElementById('stepReset');
    const stepDone = document.getElementById('stepDone');

    // nhập tài khoản/email
    const forgotForm = document.getElementById('forgotForm');
    const identifierInput = document.getElementById('identifier');
    const forgotError = document.getElementById('forgotError');
    const btnSend = document.getElementById('btnSendRequest');
    const sentIdentifier = document.getElementById('sentIdentifier');

    // nhập OTP
    const otpForm = document.getElementById('otpForm');
    const otpInput = document.getElementById('otpCode');
    const otpError = document.getElementById('otpError');
    const btnVerifyOtp = document.getElementById('btnVerifyOtp');
    const btnResend = document.getElementById('btnResend');

    // mật khẩu mới
    const resetForm = document.getElementById('resetForm');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const resetError = document.getElementById('resetError');
    const btnReset = document.getElementById('btnReset');
    const toggleNewPassword = document.getElementById('toggleNewPassword');

    // Lưu lại giữa các bước
    let identifierValue = '';
    let otpValue = '';

    function showStep(step) {
        [stepRequest, stepOtp, stepReset, stepDone].forEach(s => s.classList.add('hidden'));
        step.classList.remove('hidden');
    }


    // ---------------- BƯỚC 1: Gửi yêu cầu OTP ----------------
    forgotForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        forgotError.classList.add('hidden');

        const identifier = identifierInput.value.trim();
        if (!identifier) {
            forgotError.textContent = 'Vui lòng nhập tên đăng nhập hoặc email';
            forgotError.classList.remove('hidden');
            return;
        }

        btnSend.disabled = true;
        btnSend.textContent = 'Đang gửi...';

        try {
            await apiFetch('/auth/forgot-password', 'POST', { identifier });

            identifierValue = identifier;
            sentIdentifier.textContent = identifier;
            showStep(stepOtp);
        }
        catch (err) {
            console.log(err)
            forgotError.textContent = err.message;
            forgotError.classList.remove('hidden');
            
        }
        finally {
            btnSend.disabled = false;
            btnSend.innerHTML = 'Gửi yêu cầu';
        }
    });

    // ---------------- BƯỚC 2: Xác thực mã OTP ----------------
    otpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        otpError.classList.add('hidden');

        const otpCode = otpInput.value.trim();
        if (!otpCode) {
            otpError.textContent = 'Vui lòng nhập mã OTP';
            otpError.classList.remove('hidden');
            return;
        }

        btnVerifyOtp.disabled = true;
        btnVerifyOtp.textContent = 'Đang xác nhận...';

        try {
            await apiFetch('/auth/verify-otp', 'POST', {
                identifier: identifierValue,
                otpCode
            });

            otpValue = otpCode;
            showStep(stepReset);
        }
        catch (err) {
            otpError.textContent = err.message;
            otpError.classList.remove('hidden');
        }
        finally {
            btnVerifyOtp.disabled = false;
            btnVerifyOtp.innerHTML = 'Xác nhận';
        }
    });

    // Gửi lại mã OTP — gọi lại forgot-password với identifier đã nhớ từ bước 1
    btnResend.addEventListener('click', async () => {
        otpError.classList.add('hidden');
        try {
            await apiFetch('/auth/forgot-password', 'POST', { identifier: identifierValue });
        }
        catch (err) {
            otpError.textContent = err.message;
            otpError.classList.remove('hidden');
        }
    });

    // ---------------- BƯỚC 3: Đặt mật khẩu mới ----------------
    resetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        resetError.classList.add('hidden');

        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (!newPassword || newPassword.length < 8) {
            resetError.textContent = 'Mật khẩu mới phải có ít nhất 8 ký tự';
            resetError.classList.remove('hidden');
            return;
        }
        if (newPassword !== confirmPassword) {
            resetError.textContent = 'Mật khẩu xác nhận không khớp';
            resetError.classList.remove('hidden');
            return;
        }

        btnReset.disabled = true;
        btnReset.textContent = 'Đang xử lý...';

        try {
            await apiFetch('/auth/reset-password', 'PUT', {
                identifier: identifierValue,
                otpCode: otpValue,
                newPassword
            });

            showStep(stepDone);
        }
        catch (err) {
            resetError.textContent = err.message;
            resetError.classList.remove('hidden');
        }
        finally {
            btnReset.disabled = false;
            btnReset.innerHTML = 'Đặt lại mật khẩu';
        }
    });

    // Ẩn/hiện mật khẩu mới
    toggleNewPassword.addEventListener('click', () => {
        const isHidden = newPasswordInput.type === 'password';
        newPasswordInput.type = isHidden ? 'text' : 'password';
        toggleNewPassword.setAttribute('aria-label', isHidden ? 'Ẩn mật khẩu' : 'Hiện mật khẩu');
    });
});
