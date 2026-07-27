// login.js
// Chỉ xử lý phần UI tương tác của riêng trang login (toggle mật khẩu).
// Logic gọi API đăng nhập thật sẽ nối vào đây sau khi có api.js hoàn chỉnh.

document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    toggleBtn.addEventListener('click', () => {
        const isHidden = passwordInput.type === 'password';
        passwordInput.type = isHidden ? 'text' : 'password';
        toggleBtn.setAttribute('aria-label', isHidden ? 'Ẩn mật khẩu' : 'Hiện mật khẩu');
    });

    const form = document.getElementById('loginForm');
    const errorBox = document.getElementById('loginError');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorBox.classList.add('hidden');

        const username = document.getElementById('username').value.trim();
        const password = passwordInput.value;

        if (!username || !password) {
            errorBox.textContent = 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu';
            errorBox.classList.remove('hidden');
            return;
        }

        try {
            const res = await apiFetch('/auth/login', 'POST', { username, password });
            saveSession(username, password, res.data);

            switch (res.data.role) {
                case 'ADMIN':
                    window.location.href = 'admin/admin-dashboard.html';
                    break;
                case 'TEACHER':
                    window.location.href = 'teacher/teacher-dashboard.html';
                    break;
                case 'STUDENT':
                    window.location.href = 'student/student-dashboard.html';
                    break;
            }
        } catch (err) {
            errorBox.textContent = err.message;
            errorBox.classList.remove('hidden');
        }
    });
});


