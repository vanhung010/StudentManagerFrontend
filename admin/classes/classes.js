

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

})