document.addEventListener('DOMContentLoaded', async () => {

    const modal = document.getElementById('studentModal');
    const btnAdd = document.getElementById('btnAddStudent');
    const btnClose = document.getElementById('closeModal');
    const btnCancel = document.getElementById('cancelModal');
    const btnSave = document.getElementById('saveStudent');
    const studentForm = document.getElementById('studentForm');

    const inputCode = document.getElementById('studentCode');
    const inputFullName = document.getElementById('fullName');
    const inputDob = document.getElementById('dob');
    const inputGender = document.getElementById('gender');
    const inputEmail = document.getElementById('email');
    const inputPhone = document.getElementById('phone');
    const inputDepartment = document.getElementById('studentDepartment');
    const inputClass = document.getElementById('studentClass');
    const inputYear = document.getElementById('enrollmentYear');
    const inputUsername = document.getElementById('username');
    const inputPassword = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');

    const filterDepartment = document.getElementById('filterDepartment');
    const searchInput = document.getElementById('searchInput');
    const studentTableBody = document.getElementById('studentTableBody');

    const errorModal = document.getElementById('errorModal');
    const errorModalMessage = document.getElementById('errorModalMessage');
    const closeErrorModal = document.getElementById('closeErrorModal');

    let currentPage = 0;
    const pageSize = 10;

    // ---------------- MODAL BÁO LỖI ----------------
    // Dùng thay cho alert() — hiển thị lỗi trong modal riêng, đồng bộ giao diện
    function showError(message) {
        errorModalMessage.textContent = message || 'Có lỗi xảy ra, vui lòng thử lại.';
        errorModal.classList.remove('hidden');
    }

    closeErrorModal.addEventListener('click', () => errorModal.classList.add('hidden'));
    errorModal.addEventListener('click', (e) => {
        if (e.target === errorModal) errorModal.classList.add('hidden');
    });

    // ---------------- MỞ / ĐÓNG MODAL THÊM SINH VIÊN ----------------
    function openAddModal() {
        studentForm.reset();
        modal.classList.remove('hidden');
    }

    function closeModal() {
        modal.classList.add('hidden');
        studentForm.reset();
    }

    btnAdd.addEventListener('click', openAddModal);
    btnClose.addEventListener('click', closeModal);
    btnCancel.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    togglePassword.addEventListener('click', () => {
        inputPassword.type = inputPassword.type === 'password' ? 'text' : 'password';
    });

//----------------Điền dữ liệu vào các thẻ select---------------


function populateSelect(elementSelect, dataItem, valueKey, labelKey, placeHolder) {
    elementSelect.innerHTML = `<option value = ${''}>${placeHolder}</option>`
    dataItem.forEach(item => {
        const elementOption = document.createElement('option');

        elementOption.value = item[valueKey];
        elementOption.textContent = item[labelKey];

        elementSelect.appendChild(elementOption);
    })
}

try {
const resDepartment = await getAllDepartments('active', '', 0, size = 10000)
const resClass = await getAllClass('', inputYear.value, 'active', inputDepartment.value, 0, 8)

const allClass = resClass.data.content;
const allDepartment = resDepartment.data.content;

console.log(allDepartment)
populateSelect(inputDepartment, allDepartment, 'id', 'name', 'Chọn khoa')
populateSelect(inputClass, allClass, 'id', 'name', 'Chọn lớp')
}

catch(err){
    showError(err.message)
}
//thay đổi khoa load những lớp thuộc khoa đó
inputDepartment.addEventListener('change', async () => {
    if(!inputClass.value){
const resClass = await getAllClass('', inputYear.value, 'active', inputDepartment.value, page = 0, size = 8)
const allClass = resClass.data.content;
populateSelect(inputClass, allClass, 'id', 'name', 'Chọn lớp')}
})
//Chọn lớp, load khoa của lớp đó
inputClass.addEventListener('change', async () => {
    if(!inputDepartment){
    const resDepartment = await getAllDepartments('active', '', 0, size = 10000, inputClass.value)
    const departmentData = resDepartment.data.content;
    populateSelect(inputDepartment, departmentData, 'id', 'name', 'Chọn khoa')}
})
});
