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


    btnSave.addEventListener('click', async () => {
        const code = document.getElementById('departmentCode').value.trim();
        const name = document.getElementById('departmentName').value.trim();

        if (!code || !name) {
            alert('Vui lòng nhập đầy đủ Mã Khoa và Tên Khoa');
            return;
        }

        btnSave.disabled = true;
        btnSave.textContent = 'Đang lưu'

        try {
            const res = await apiFetch("/departments", "POST", {
                departmentCode: code,
                name: name
            });
            closeModal();

        }
        catch(err){
            alert(err.message)
        }
        finally {
            btnSave.disable = false;
            btnSave.textContent = "Lưu"
        }
});

    async function loadDepartments(){
        try {
            const res = await apiFetch("/departments")
            renderTable(res.data);

        }
        catch(err){
            console.log(err.message);
        }
    }

    function renderTable(departments){
        const tbody = document.querySelector(".table tbody");
        tbody.innerHTML ='';

        departments.forEach(dept => {
            const row = document.createElement('tr');
            row.innerHTML = `
             <td><strong>${dept.departmentCode}</strong></td>
                            <td class="text-primary-color">${dept.name}</td>
                            <td>450</td>
                            <td>45</td>
                            <td class="col-actions">
                                <button class="btn-icon" title="Sửa">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z"></path></svg>
                                </button>
                                <button class="btn-icon danger" title="Xóa">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                </button>
                            </td>
            `;
            tbody.appendChild(row);
        })
    }

    loadDepartments();
});
