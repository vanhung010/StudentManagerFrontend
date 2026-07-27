// forgot-password.js
// Xử lý UI chuyển từ bước "Nhập tài khoản" sang bước "Đã gửi thành công".
// Logic gọi API thật (POST /auth/forgot-password) nối vào khi Backend có endpoint này.

document.addEventListener('DOMContentLoaded', () => {
    const stepRequest = document.getElementById('stepRequest');
    const stepSuccess = document.getElementById('stepSuccess');
    const form = document.getElementById('forgotForm');
    const errorBox = document.getElementById('forgotError');
    const btnSend = document.getElementById('btnSendRequest');
    const btnResend = document.getElementById('btnResend');
    const sentIdentifier = document.getElementById('sentIdentifier');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorBox.classList.add('hidden');

        const identifier = document.getElementById('identifier').value.trim();

        if (!identifier) {
            errorBox.textContent = 'Vui lòng nhập tên đăng nhập hoặc email';
            errorBox.classList.remove('hidden');
            return;
        }

        btnSend.disabled = true;
        btnSend.textContent = 'Đang gửi...';

        try {
            // TODO: gọi API thật khi Backend có endpoint /auth/forgot-password
            // await apiFetch('/auth/forgot-password', 'POST', { identifier });

            sentIdentifier.textContent = identifier;
            stepRequest.classList.add('hidden');
            stepSuccess.classList.remove('hidden');

        } catch (err) {
            errorBox.textContent = err.message;
            errorBox.classList.remove('hidden');
        } finally {
            btnSend.disabled = false;
            btnSend.innerHTML = 'Gửi yêu cầu';
        }
    });

    btnResend.addEventListener('click', () => {
        stepSuccess.classList.add('hidden');
        stepRequest.classList.remove('hidden');
    });



    
});
