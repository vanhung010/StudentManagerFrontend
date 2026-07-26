// departments.js
// Xử lý UI: mở/đóng modal Thêm Khoa. Logic gọi API thật (GET/POST/PUT/DELETE
// /api/departments) sẽ nối vào sau khi api.js hoàn chỉnh.

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('departmentModal');
    const btnAdd = document.getElementById('btnAddDepartment');
    const btnClose = document.getElementById('closeModal');
    const btnCancel = document.getElementById('cancelModal');
    const btnSave = document.getElementById('saveDepartment');

    function openModal() {
        modal.classList.remove('hidden');
    }

    function closeModal() {
        modal.classList.add('hidden');
        document.getElementById('departmentForm').reset();
    }

    btnAdd.addEventListener('click', openModal);
    btnClose.addEventListener('click', closeModal);
    btnCancel.addEventListener('click', closeModal);

    // Đóng modal khi bấm ra ngoài vùng trắng
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    btnSave.addEventListener('click', () => {
        const code = document.getElementById('departmentCode').value.trim();
        const name = document.getElementById('departmentName').value.trim();

        if (!code || !name) {
            alert('Vui lòng nhập đầy đủ Mã Khoa và Tên Khoa');
            return;
        }

        // TODO: gọi apiFetch('/departments', 'POST', { departmentCode: code, name })
        // sau đó reload lại bảng danh sách

        closeModal();
    });
});
