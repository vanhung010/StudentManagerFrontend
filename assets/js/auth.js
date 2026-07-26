// Lưu thông tin đăng nhập sau khi login thành công
function saveSession(username, password, userData) {
    const credentials = btoa(`${username}:${password}`);
    sessionStorage.setItem('credentials', credentials);
    sessionStorage.setItem('user', JSON.stringify(userData));
}

// Lấy thông tin user hiện tại
function getCurrentUser() {
    const user = sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// Xóa session khi đăng xuất
function clearSession() {
    sessionStorage.removeItem('credentials');
    sessionStorage.removeItem('user');
}

// Chặn truy cập nếu chưa đăng nhập HOẶC sai role — gọi ở đầu mỗi trang
function requireRole(expectedRole) {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = getLoginPath();
        return;
    }
    if (user.role !== expectedRole) {
        window.location.href = getLoginPath();
    }
}

// Tính đường dẫn về login.html tương đối theo độ sâu thư mục hiện tại cái này chịu AI nó generate :)
function getLoginPath() {
    const depth = window.location.pathname.split('/').filter(Boolean).length;
    return '../'.repeat(Math.max(depth - 1, 0)) + 'login.html';
}