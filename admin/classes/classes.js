

document.addEventListener('DOMContentLoaded', async () => {


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
const advisorDropdown = document.getElementById('advisorDropdown');
const filterDepartment = document.getElementById('filterDepartment');
const filterYear = document.getElementById('filterYear');
const filterStatus = document.getElementById('filterStatus');
const searchInput = document.getElementById('searchInput');
const classTableBody = document.getElementById('classTableBody');


let editingRow = null;   // giữ tham chiếu tới <tr> đang sửa, null nếu đang ở chế độ Thêm mới

const STATUS_META = {
    ACTIVE: {
        label: 'Đang hoạt động',
        badgeClass: 'badge-success',
    },
    DELETED: {
        label: 'Đã xóa',
        badgeClass: 'badge-danger',
    },
};

function getRowStatus(row) {
    return row.dataset.status || 'ACTIVE';
}

function getStatusMeta(status) {
    return STATUS_META[status] || STATUS_META.ACTIVE;
}

function renderRowStatus(row) {
    const status = getRowStatus(row);
    const statusCell = row.querySelector('.status-cell');
    const actionCell = row.querySelector('.col-actions');

    if (statusCell) {
        const meta = getStatusMeta(status);
        statusCell.innerHTML = `<span class="badge ${meta.badgeClass} status-badge">${meta.label}</span>`;
    }

    if (actionCell) {
        const isDeleted = status === 'DELETED';
        actionCell.innerHTML = `
            <div class="action-buttons">
                <button class="btn-icon" title="Sửa" onclick="openEditModal(this)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z"></path></svg>
                </button>
                <button class="btn-icon ${isDeleted ? '' : 'danger'}" title="${isDeleted ? 'Khôi phục' : 'Xóa'}" onclick="${isDeleted ? 'restoreClass(this)' : 'deleteClass(this)'}">
                    ${isDeleted ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"></path><polyline points="3 3 3 9 9 9"></polyline></svg>' : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>'}
                </button>
            </div>
        `;
    }
}

function applyClassFilters() {
    const department = filterDepartment?.value || '';
    const year = filterYear?.value || '';
    const status = filterStatus?.value || '';
    const keyword = (searchInput?.value || '').trim().toLowerCase();

    classTableBody.querySelectorAll('tr').forEach((row) => {
        const rowDepartment = row.dataset.department || '';
        const rowYear = row.dataset.year || '';
        const rowStatus = getRowStatus(row);
        const rowCode = (row.dataset.code || '').toLowerCase();
        const rowName = (row.dataset.name || '').toLowerCase();
        const rowAdvisor = (row.dataset.advisor || '').toLowerCase();

        const matchesDepartment = !department || rowDepartment === department;
        const matchesYear = !year || rowYear === year;
        const matchesStatus = !status || rowStatus === status;
        const matchesKeyword = !keyword || [rowCode, rowName, rowAdvisor, rowDepartment, rowYear, rowStatus.toLowerCase()].some((field) => field.includes(keyword));

        row.classList.toggle('hidden', !(matchesDepartment && matchesYear && matchesStatus && matchesKeyword));
    });
}

// ---------------- MỞ / ĐÓNG MODAL ----------------

function openAddModal() {
    editingRow = null;
    modalTitle.textContent = 'Thêm Lớp hành chính';
    classForm.reset();
    modal.classList.remove('hidden');
}

function closeModal() {
    modal.classList.add('hidden');
    classForm.reset();
    editingRow = null;
}

function updateRowStatus(row, status) {
    row.dataset.status = status;
    renderRowStatus(row);
    applyClassFilters();
}

btnAdd.addEventListener('click', openAddModal);
btnClose.addEventListener('click', closeModal);
btnCancel.addEventListener('click', closeModal);

modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

//------------Search advisor trong modal thêm lớp-----------------

function hideAdvisorDropdown() {
    advisorDropdown.classList.add('hidden');
    advisorDropdown.innerHTML = '';
}

async function renderAdvisorDropdown(keyword = '', departmentId = '') {
    

    const res = await getAllTeacher(undefined, undefined, departmentId);
    const data = res.data.content;


    const normalizedKeyword = keyword.trim().toLowerCase(); //dữ liệu nhập vào
    const filteredAdvisors = data.filter((advisor) => {
        if (!normalizedKeyword) return true;
        return advisor.fullName.toLowerCase().includes(normalizedKeyword) || advisor.departmentName.toLowerCase().includes(normalizedKeyword);
    });

    advisorDropdown.innerHTML = '';

    if (!filteredAdvisors.length) {
        const emptyState = document.createElement('div');
        emptyState.className = 'advisor-item';
        emptyState.style.cursor = 'default';
        emptyState.innerHTML = '<span class="advisor-item-name">Không tìm thấy giảng viên</span><span class="advisor-item-department">Thử nhập từ khóa khác</span>';
        advisorDropdown.appendChild(emptyState);
        advisorDropdown.classList.remove('hidden');
        return;
    }

    filteredAdvisors.forEach((advisor) => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'advisor-item';
        item.innerHTML = `
            <span class="advisor-item-name">${advisor.fullName}</span>
            <span class="advisor-item-department">${advisor.departmentName}</span>
        `;

        item.addEventListener('click', () => {
            inputAdvisor.value = advisor.fullName;
            inputAdvisor.setAttribute("id-advisor", advisor.id)
            hideAdvisorDropdown();
            
        });

        advisorDropdown.appendChild(item);
    });

    advisorDropdown.classList.remove('hidden');
}


// -------------ĐỔ DỮ LIỆU VÀO DROPDOWN DEPARTMENT-------------------------

function populate(selectElement, departments, placeholderText){
    selectElement.innerHTML = `  <option value="">${placeholderText}</option>` //Dòng đầu

    departments.forEach(dept => {
        const option = document.createElement('option')
        option.textContent = `${dept.name}`;
        option.value = `${dept.id}`
        selectElement.appendChild(option)
    })

}




inputAdvisor.addEventListener('focus', () => renderAdvisorDropdown(inputAdvisor.value, document.getElementById('classDepartment').value));
inputAdvisor.addEventListener('click', () => renderAdvisorDropdown(inputAdvisor.value, document.getElementById('classDepartment').value));
inputAdvisor.addEventListener('input', () => renderAdvisorDropdown(inputAdvisor.value, document.getElementById('classDepartment').value));
inputAdvisor.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') hideAdvisorDropdown();
});

document.addEventListener('click', (event) => {
    if (!event.target.closest('.advisor-input-wrap')) {
        hideAdvisorDropdown();
    }
});

    let dataAllDepartment = await apiFetch('/departments');
    let departments = dataAllDepartment.data.content;

    populate(document.getElementById('filterDepartment'), departments, 'Tất cả khoa');
    populate(document.getElementById('classDepartment'), departments, 'Chọn khoa quản lí')

    filterDepartment.addEventListener('change', applyClassFilters);
    filterYear.addEventListener('change', applyClassFilters);
    filterStatus.addEventListener('change', applyClassFilters);
    searchInput.addEventListener('input', applyClassFilters);

    classTableBody.querySelectorAll('tr').forEach(renderRowStatus);
    applyClassFilters();


//----------------------------------------Lưu lớp mới------------------

btnSave.addEventListener('click', async () => {
    const inputCodeData = inputCode.value;
    const inputNameData = inputName.value;
    const departmentId = inputDepartment.value;
    const advisorId = inputAdvisor.getAttribute('id-advisor')
    const inputYearData = inputYear.value;

        btnSave.disabled = true;
        btnSave.textContent = 'Đang lưu';

    try{
        await apiFetch('/classes', 'POST', {
            classCode: inputCodeData,
            name: inputNameData,
            departmentId: departmentId,
            advisorId: advisorId,
            enrollmentYear: inputYearData
        })
        closeModal();
    }
    catch(err){
        alert(err.message)
    }
    finally {
        btnSave.disabled = false;
        btnSave.textContent = 'Lưu';
    }
})


//--------------Load lớp ------------------

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

function deleteClass(button) {
    const row = button.closest('tr');
    updateRowStatus(row, 'DELETED');
}

function restoreClass(button) {
    const row = button.closest('tr');
    updateRowStatus(row, 'ACTIVE');
}

window.openEditModal = openEditModal;
window.deleteClass = deleteClass;
window.restoreClass = restoreClass;



})