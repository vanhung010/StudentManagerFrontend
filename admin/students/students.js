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

let isSyncing = false;
//Chọn khoa -> Load lớp của khoa đó
inputDepartment.addEventListener('change', async () => {
    if(isSyncing) return ;

    const departmentId = inputDepartment.value;

    if(!departmentId) {
        populateSelect(inputClass, [], 'id', 'name', 'Chọn lớp')
        return;
    }

const resClass = await getAllClass('', '', 'active', departmentId, 0, 100000)
const allClass = resClass.data.content;


populateSelect(inputClass, allClass, 'id', 'name', 'Chọn lớp')
})
//Chọn lớp, load khoa của lớp đó
inputClass.addEventListener('change', async () => {
    
    const classId = inputClass.value;

    if(!classId) return;


    const resClass = await getClass(inputClass.value)
    const classData = resClass.data;

   
    if (!classData) return; 

     isSyncing = true; //Chặn lại không đổi khoa 

     inputDepartment.value = classData.departmentId; 
     isSyncing = false;

     //Load năm 
     inputYear.value = classData.enrollmentYear
     inputYear.readOnly = true
})

//---------------Lưu học sinh-----------------
btnSave.addEventListener('click', async () => {
    try {

        btnSave.disabled = true;
        btnSave.textContent = 'Đang lưu'
    await createStudent({
        studentCode: inputCode.value,
        fullName: inputFullName.value,
        dob: inputDob.value,
        gender: inputGender.value,
        email: inputEmail.value,
        phone: inputPhone.value,
        departmentId: inputDepartment.value,
        classId: inputClass.value,
        enrollmentYear: inputYear.value,
        username: inputUsername.value,
        password: inputPassword.value
    })
     btnSave.disabled = false;
     closeModal()
}
catch(err){
    showError(err.message)
}
})
//-------------Load data-----------------
function gpaClass(gpa){
     if (gpa === null || gpa === undefined) return 'badge-neutral';
    if (gpa >= 3.2) return 'badge-success';
    if (gpa >= 2.5) return 'badge-warning';
    return 'badge-danger';
}
function renderTable(students){
 studentTableBody.innerHTML = '';

    if (!students.length) {
        studentTableBody.innerHTML = `<tr><td colspan="7" class="table-empty">Không có sinh viên nào</td></tr>`;
        return;
    }
    students.forEach(student => {
        const row = document.createElement('tr');
        const gpaValue = student.gpa !== null && student.gpa !== undefined ? student.gpa : '-';

        row.innerHTML = `
            <td>
                <div class="advisor-cell">
                    <img class="avatar avatar-sm" src="https://i.pravatar.cc/64?u=${student.id}" alt="">
                    <span>${student.fullName}</span>
                </div>
            </td>
            <td>${student.studentCode}</td>
            <td>${student.classes ? student.classes.classCode : '-'}</td>
            <td class="text-primary-color">${student.department ? student.department.name : '-'}</td>
            <td>${student.email}</td>
            <td><span class="badge ${gpaClass(student.gpa)}">${gpaValue}</span></td>
            <td class="col-actions">
                <button class="btn-icon" title="Xem chi tiết" onclick="location.href='detail.html?id=${student.id}'">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                </button>
            </td>
        `;
        studentTableBody.appendChild(row);
    });

}

function renderPagination(page, totalPages, totalElements, size){
    const from = totalElements === 0 ? 0 : page * size + 1;
    const to = Math.min((page + 1) * size, totalElements);

    document.querySelector('.pagination span').textContent =
        `Hiển thị ${from}-${to} trong số ${totalElements} sinh viên`;

    //Thanh điều khiển
    const control = document.querySelector('.pagination-controls');
    control.innerHTML = '';

}

// async function loadAllClass()

});
