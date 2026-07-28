

const modal = document.getElementById('classModal');
const modalTitle = document.getElementById('modalTitle');
const btnAdd = document.getElementById('btnAddClass');
const btnClose = document.getElementById('closeModal');
const btnCancel = document.getElementById('cancelModal');

const btnSave = document.getElementById('saveClass');
const classForm = document.getElementById('classForm');

const inputCode = document.getElementById('classCode');
const inputName = document.getElementById('className');
const inputDepartment = document.getElementById('classDepartment');
const inputAdvisor = document.getElementById('classAdvisor');
const inputYear = document.getElementById('classYear');

let editingRow = null;   // giữ tham chiếu tới <tr> đang sửa, null nếu đang ở chế độ Thêm mới

// ---------------- MỞ / ĐÓNG MODAL ----------------

function openAddModal() {
    editingRow = null;
    modalTitle.textContent = 'Thêm Lớp hành chính';
    classForm.reset();
    modal.classList.remove('hidden');
}

function openEditModal(button) {
    const row = button.closest('tr');
    editingRow = row;

    modalTitle.textContent = 'Sửa Lớp hành chính';

    // Điền sẵn dữ liệu cũ từ data-attribute của dòng đang sửa
    inputCode.value = row.dataset.code;
    inputName.value = row.dataset.name;
    inputDepartment.value = row.dataset.department;
    inputAdvisor.value = row.dataset.advisor;
    inputYear.value = row.dataset.year;

    modal.classList.remove('hidden');
}

function closeModal() {
    modal.classList.add('hidden');
    classForm.reset();
    editingRow = null;
}

btnAdd.addEventListener('click', openAddModal);
btnClose.addEventListener('click', closeModal);
btnCancel.addEventListener('click', closeModal);

modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

// ---------------- LƯU (THÊM MỚI hoặc CẬP NHẬT) ----------------

btnSave.addEventListener('click', () => {
    const code = inputCode.value.trim();
    const name = inputName.value.trim();
    const department = inputDepartment.value;
    const advisor = inputAdvisor.value.trim();
    const year = inputYear.value.trim();

    if (!code || !name || !department || !year) {
        alert('Vui lòng nhập đầy đủ Mã Lớp, Tên Lớp, Khoa và Năm nhập học');
        return;
    }

    // TODO: gọi API thật ở đây
    // if (editingRow) {
    //     await apiFetch(`/classes/${editingRow.dataset.id}`, 'PUT', {...});
    // } else {
    //     await apiFetch('/classes', 'POST', {...});
    // }

    if (editingRow) {
        updateRow(editingRow, { code, name, department, advisor, year });
    } else {
        addRow({ code, name, department, advisor, year });
    }

    closeModal();
});

// ---------------- CẬP NHẬT GIAO DIỆN BẢNG (demo, không gọi API) ----------------

function updateRow(row, data) {
    row.dataset.code = data.code;
    row.dataset.name = data.name;
    row.dataset.department = data.department;
    row.dataset.advisor = data.advisor;
    row.dataset.year = data.year;

    row.children[0].innerHTML = `<strong>${data.code}</strong>`;
    row.children[1].textContent = data.name;
    row.children[2].innerHTML = `<span class="badge badge-info">${data.department}</span>`;
    row.children[3].querySelector('span').textContent = data.advisor;
    row.children[5].textContent = data.year;
}

function addRow(data) {
    const tbody = document.getElementById('classTableBody');
    const row = document.createElement('tr');

    row.dataset.code = data.code;
    row.dataset.name = data.name;
    row.dataset.department = data.department;
    row.dataset.advisor = data.advisor;
    row.dataset.year = data.year;

    row.innerHTML = `
        <td><strong>${data.code}</strong></td>
        <td class="text-primary-color">${data.name}</td>
        <td><span class="badge badge-info">${data.department}</span></td>
        <td>
            <div class="advisor-cell">
                <img class="avatar avatar-sm" src="https://i.pravatar.cc/64?img=20" alt="">
                <span>${data.advisor || 'Chưa gán'}</span>
            </div>
        </td>
        <td>
            <span class="student-count">0 sinh viên</span>
        </td>
        <td>${data.year}</td>
        <td class="col-actions">
            <button class="btn-icon" title="Sửa" onclick="openEditModal(this)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z"></path></svg>
            </button>
            <button class="btn-icon danger" title="Xóa" onclick="deleteClass(this)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
        </td>
    `;

    tbody.appendChild(row);
}

// ---------------- XÓA ----------------

function deleteClass(button) {
    const row = button.closest('tr');
    const className = row.dataset.name;

    if (!confirm(`Bạn có chắc muốn xóa lớp "${className}"?`)) return;

    // TODO: gọi API thật ở đây
    // await apiFetch(`/classes/${row.dataset.id}`, 'DELETE');

    row.remove();
}

// ---------------- LỌC + TÌM KIẾM (demo, lọc trực tiếp trên dòng đang hiển thị) ----------------

const filterDepartment = document.getElementById('filterDepartment');
const filterYear = document.getElementById('filterYear');
const searchInput = document.getElementById('searchInput');

function applyFilters() {
    const dept = filterDepartment.value;
    const year = filterYear.value;
    const keyword = searchInput.value.trim().toLowerCase();

    document.querySelectorAll('#classTableBody tr').forEach(row => {
        const matchDept = !dept || row.dataset.department === dept;
        const matchYear = !year || row.dataset.year === year;
        const matchKeyword = !keyword ||
            row.dataset.name.toLowerCase().includes(keyword) ||
            row.dataset.code.toLowerCase().includes(keyword);

        row.style.display = (matchDept && matchYear && matchKeyword) ? '' : 'none';
    });

    // TODO: khi có API thật, thay bằng gọi lại
    // apiFetch(`/classes?departmentId=${dept}&enrollmentYear=${year}&name=${keyword}`)
}

filterDepartment.addEventListener('change', applyFilters);
filterYear.addEventListener('change', applyFilters);
searchInput.addEventListener('input', applyFilters);
