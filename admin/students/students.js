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
    const filterEnrollemnt = document.getElementById('filterYear')
    const filterStatus = document.getElementById('filterStatus');
    const studentTableBody = document.getElementById('studentTableBody');

    const errorModal = document.getElementById('errorModal');
    const errorModalMessage = document.getElementById('errorModalMessage');
    const closeErrorModal = document.getElementById('closeErrorModal');

    let currentPage = 0;
    const pageSize = 10;

    // ---------------- MODAL BÁO LỖI ----------------
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

     inputYear.value = '';
    inputYear.readOnly = false;

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
      loadAllStudent(searchInput.value, filterDepartment.value, filterEnrollemnt.value, filterStatus.value, currentPage
      )
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
        row.dataset.id = student.id;
        row.classList.add('clickable-row');

        const gpaValue = student.gpa !== null && student.gpa !== undefined ? student.gpa : '-';
        let statusHtml;
        let iconHtml;
        if(student.isDeleted){
            statusHtml = ' <td><span class="badge badge-danger">Đã xóa</span></td>'
            iconHtml = ` <td class="col-actions">
                                <div class="action-buttons">
                                    <button class="btn-icon" title="Sửa" onclick="openEditModal(this)">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z"></path></svg>
                                    </button>
                                    <button class="btn-icon restore" title="Khôi phục" data-id = ${student.id} data-name = ${student.fullName}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"></path><polyline points="3 3 3 9 9 9"></polyline></svg>
                                    </button>
                                </div>
                            </td>`
        }
        else {
             statusHtml = '<td><span class="badge badge-success">Đang hoạt động</span></td>'
             iconHtml = `<td class="col-actions">
                                <div class="action-buttons">
                                    <button class="btn-icon update" title="Sửa">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z"></path></svg>
                                    </button>
                                    <button class="btn-icon danger" title="Xóa"  data-id = ${student.id} data-name = ${student.fullName} >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                    </button>
                                </div>
                            </td>`
        }
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
            ${statusHtml}
            ${iconHtml}
        `;
        studentTableBody.appendChild(row);
    });
}

function renderPagination(page, totalPages, totalElements, size = 10){
    const from = totalElements === 0 ? 0 : page * size + 1;
    const to = Math.min((page + 1) * size, totalElements);

    document.querySelector('.pagination span').textContent =
        `Hiển thị ${from}-${to} trong số ${totalElements} sinh viên`;

    //Thanh điều khiển
    const control = document.querySelector('.pagination-controls');
    control.innerHTML = '';

    const gotoPage = (pageTarget) => {
        loadAllStudent(searchInput.value, filterDepartment.value, filterEnrollemnt.value, filterStatus.value, pageTarget)
    }

    //Nút trước
    const btnPrev = document.createElement('button');
    btnPrev.textContent = '<'
    btnPrev.disabled = page === 0;
    btnPrev.addEventListener('click',() =>  gotoPage(page-1));
    control.appendChild(btnPrev);

    //Hiện trang đầu, cuối, trang hiện tại, trang liền trước, liền sau
    const pageToShow = new Set([0, totalPages - 1, page]);
    if(page-1 >= 0) pageToShow.add(page-1);
    if(page+1 <= totalPages - 1) pageToShow.add(page+1);

    const sortPage = Array.from(pageToShow)
                            .filter(p => p >= 0 & p < totalPages)
                            .sort((a,b) => a-b);
    
    let previousPage = null;
    sortPage.forEach(p => {
         if (previousPage !== null && p - previousPage > 1) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'pagination-ellipsis';
            ellipsis.textContent = '...';
            control.appendChild(ellipsis);
         }
         const btnPage = document.createElement('button');
        btnPage.textContent = p + 1;         
        if (p === page) btnPage.classList.add('active');
        btnPage.addEventListener('click', () => goToPage(p));   
        control.appendChild(btnPage);

        previousPage = p;

    })

    const btnNext = document.createElement('button');
    btnNext.textContent = '›';
    btnNext.disabled = page >= totalPages - 1;
    btnNext.addEventListener('click', () => goToPage(page + 1));
    control.appendChild(btnNext);
            
}

async function loadAllStudent(name = '', departmentId = '', enrollmentYear = '', status = 'active', page = 0, size = 10){
    try {
        const res = await getAllStudent(name, departmentId, enrollmentYear, status,  page, size);
        const pageData = res.data;
        currentPage = pageData.currentPage;

        renderTable(pageData.content);
        renderPagination(currentPage, pageData.totalPages, pageData.totalElements)
    }
    catch(err){
        showError(err.message)
    }
}

loadAllStudent()
//---------------------------------Lọc-----------------
//Khoa
const resDepartment = await getAllDepartments('active', '', 0, 1000000, '');
const resEnrollmentYear =  await getAllEnrollmentYear();

const allDepartmentActive = resDepartment.data.content;
const allEnrollmentYear = resEnrollmentYear.data.sort((a,b) => b-a)

allDepartmentActive.forEach((p) => {
    const elementOption = document.createElement('option');
    elementOption.value = p.id;
    elementOption.textContent = p.name;
    filterDepartment.appendChild(elementOption);
})
allEnrollmentYear.forEach(p => {
    const elementOption = document.createElement('option');
    elementOption.value = p;
    elementOption.textContent = p;
    filterEnrollemnt.appendChild(elementOption)
})
filterDepartment.addEventListener('change', () => {
    loadAllStudent(searchInput.value, filterDepartment.value, filterEnrollemnt.value, filterStatus.value, currentPage)
})
filterStatus.addEventListener('change', () => {
    loadAllStudent(searchInput.value, filterDepartment.value, filterEnrollemnt.value, filterStatus.value, currentPage)
})
filterEnrollemnt.addEventListener('change', () => {
    loadAllStudent(searchInput.value, filterDepartment.value, filterEnrollemnt.value, filterStatus.value, currentPage)
})
searchInput.addEventListener('input', () => {
   
     loadAllStudent(searchInput.value, filterDepartment.value, filterEnrollemnt.value, filterStatus.value, currentPage)
})

studentTableBody.addEventListener('click', async (e) => {

    const deleteBtn = e.target.closest('.btn-icon.danger');
    const restoreBtn = e.target.closest('.btn-icon.restore');
    const updateBtn = e.target.closest('.btn-icon.update');
    const row = e.target.closest('tr[data-id]');

    // ---------------- XÓA ----------------
    if (deleteBtn) {
        if (!confirm(`Bạn có chắc muốn xóa sinh viên "${deleteBtn.dataset.name}"?`)) return;

        deleteBtn.disabled = true;
        try {
            await apiFetch(`/students/${deleteBtn.dataset.id}`, 'DELETE');
            await loadAllStudent(searchInput.value, filterDepartment.value, currentPage);
        } catch (err) {
            showError(err.message);
        } finally {
            deleteBtn.disabled = false;
        }
        return;   // dừng lại — KHÔNG cho rơi xuống điều hướng chi tiết
    }

    // ---------------- KHÔI PHỤC ----------------
    if (restoreBtn) {
        if (!confirm(`Bạn có chắc muốn khôi phục sinh viên "${restoreBtn.dataset.name}"?`)) return;

        restoreBtn.disabled = true;
        try {
            await apiFetch(`/students/${restoreBtn.dataset.id}/restore`, 'PATCH');
            await loadAllStudent(searchInput.value, filterDepartment.value, currentPage);
        } catch (err) {
            showError(err.message);
        } finally {
            restoreBtn.disabled = false;
        }
        return;
    }

    // ---------------- SỬA ----------------
    if (updateBtn) {
        openEditModal(updateBtn);
        return;
    }

    // ---------------- KHÔNG BẤM TRÚNG NÚT NÀO — điều hướng sang trang chi tiết ----------------
    if (row) {
        location.href = `detail.html?id=${row.dataset.id}`;
    }
});


//------------------------------Xóa-------------


});
