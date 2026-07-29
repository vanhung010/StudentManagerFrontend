
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


// -------------ĐỔ DỮ LIỆU VÀO DROPDOWN DEPARTMENT

function populate(selectElement, departments, placeholderText){
    selectElement.innerHTML = `  <option value="">${placeholderText}</option>` //Dòng đầu

    departments.forEach(dept => {
        const option = document.createElement('option')
        option.textContent = `${dept.name}`;
        option.value = `${dept.id}`
        selectElement.appendChild(option)
    })

}

    let dataAllDepartment = await apiFetch('/departments');
    let departments = dataAllDepartment.data.content;

    populate(document.getElementById('filterDepartment'), departments, 'Tất cả khoa');
    populate(document.getElementById('classDepartment'), departments, 'Chọn khoa quản lí')
})