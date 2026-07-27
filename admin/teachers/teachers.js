// ============================================================
// TEACHERS.JS — Quản lý Giảng viên
// ============================================================

let currentPage = 0;
const pageSize = 10;

const departmentFilter = document.getElementById('departmentFilter');
const searchInput = document.querySelector('.table-toolbar .search-box input');
const modal = document.getElementById('teacherModal');
const teacherForm = document.getElementById('teacherForm');
const btnAddTeacher = document.getElementById('btnAddTeacher');
const btnSave = document.getElementById('saveTeacher');

// ---------------- Modal Thêm Giảng viên ----------------
function openModal() {
    teacherForm.reset();
    modal.classList.remove('hidden');
}

function closeModal() {
    modal.classList.add('hidden');
    teacherForm.reset();
}

btnAddTeacher.addEventListener('click', openModal);
document.getElementById('closeModal').addEventListener('click', closeModal);
document.getElementById('cancelModal').addEventListener('click', closeModal);

// Bấm ra ngoài modal (lên overlay) cũng đóng lại
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

// ---------------- Ẩn/hiện mật khẩu ----------------
document.getElementById('togglePassword').addEventListener('click', () => {
    const passwordInput = document.getElementById('teacherPassword');
    passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
});

// ---------------- Lưu (Tạo Giảng viên) ----------------
