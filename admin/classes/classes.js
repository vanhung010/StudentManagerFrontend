

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


const containButton = document.querySelector('.action-buttons');

let editingId = null;   // giữ tham chiếu tới <tr> đang sửa, null nếu đang ở chế độ Thêm mới




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

function openEditModel(button){

    const row = button.closest('tr');
    editingRow = row.getAttribute('classId');

    modalTitle.textContent = 'Sửa Lớp hành chính';

    inputCode.value = row.children[0].textContent.trim();
    inputName.value = row.children[1].textContent.trim();
    inputYear.value = row.children[5].textContent.trim();


    const resDepartment = await apiFetch(`/department/${editingId}`);
    const department = resDepartment.data;

    inputDepartment


    modal.classList.remove('hidden');
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

inputAdvisor.addEventListener('focus', () => renderAdvisorDropdown(inputAdvisor.value, document.getElementById('classDepartment').value));
inputAdvisor.addEventListener('click', () => renderAdvisorDropdown(inputAdvisor.value, document.getElementById('classDepartment').value));
inputAdvisor.addEventListener('input', () => renderAdvisorDropdown(inputAdvisor.value, document.getElementById('classDepartment').value));
inputAdvisor.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') hideAdvisorDropdown();
});


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


document.addEventListener('click', (event) => {
    if (!event.target.closest('.advisor-input-wrap')) {
        hideAdvisorDropdown();
    }
});

    let dataAllDepartment = await apiFetch('/departments');
    let departments = dataAllDepartment.data.content;

    populate(document.getElementById('filterDepartment'), departments, 'Tất cả khoa');
    populate(document.getElementById('classDepartment'), departments, 'Chọn khoa quản lí')


//-------------------Load all năm---------

async function loadEnrollmentYear(){
    try {
        const res = await apiFetch('/classes/enrollment-years');
        const data = res.data
        
        filterYear.innerHTML = ' <option value="">Tất cả năm</option>';

        data.forEach(yearItem => {
            const optionTag = document.createElement('option');
            optionTag.textContent = yearItem
            optionTag.value = yearItem
           
            filterYear.appendChild(optionTag)
        })


    }
    catch(e){
        console.log(e.message)
    }
}

await loadEnrollmentYear()
//----------------------------------------Lưu lớp mới--------------------

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

async function loadAllClass(keyword = '', enrollmentYear = '', status = '', idDepartment =''){

const resAllClass = await getAllClass(keyword, enrollmentYear, status, idDepartment);

const allClass = resAllClass.data.content;

 classTableBody.innerHTML ='';

 console.log(allClass)
allClass.forEach((classItem) => {


    const row = document.createElement('tr');
     row.setAttribute('classId', classItem.id);
    //Nếu lớp hiển thị chưa xóa
   if(!classItem.isDeleted){
        row.innerHTML = `
                    <td><strong>${classItem.classCode}</strong></td>
                            <td class="text-primary-color">${classItem.name}</td>
                            <td><span class="badge badge-info" data-departmentid = ${classItem.departmentId}>${classItem.departmentCode}</span></td>
                            <td>
                                <div class="advisor-cell">
                                    <img class="avatar avatar-sm" src="https://i.pravatar.cc/64?img=33" alt="">
                                    <span>${classItem.fullNameTeacher}</span>
                                </div>
                            </td>
                            <td>
                                <span class="student-count">${classItem.totalStudents} sinh viên</span>
                            </td>
                            <td>${classItem.enrollmentYear}</td>
                            <td class="status-cell"><span class="badge badge-success status-badge">Đang hoạt động</span></td>
                            <td class="col-actions">
                                <div class="action-buttons">
                                    <button class="btn-icon" title="Sửa" onclick="openEditModal(this)">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z"></path></svg>
                                    </button>
                                    <button class="btn-icon danger" title="Xóa"  data-id = ${classItem.id} data-name = ${classItem.name}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                    </button>
                                </div>
                            </td>`
   }
   else {
        row.innerHTML = `
         <td><strong>${classItem.classCode}</strong></td>
                            <td class="text-primary-color">${classItem.name}</td>
                            <td><span class="badge badge-warning" data-departmentid = ${classItem.departmentId}>${classItem.departmentCode}</span></td>
                            <td>
                                <div class="advisor-cell">
                                    <img class="avatar avatar-sm" src="https://i.pravatar.cc/64?img=52" alt="">
                                    <span>${classItem.fullNameTeacher}</span>
                                </div>
                            </td>
                            <td>
                                <span class="student-count">${classItem.totalStudents} sinh viên</span>
                            </td>
                            <td>${classItem.enrollmentYear}</td>
                            <td class="status-cell"><span class="badge badge-danger status-badge">Đã xóa</span></td>
                            <td class="col-actions">
                                <div class="action-buttons">
                                    <button class="btn-icon" title="Sửa" onclick="openEditModal(this)">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z"></path></svg>
                                    </button>
                                    <button class="btn-icon restore" title="Khôi phục" data-id = ${classItem.id} data-name = ${classItem.name} >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"></path><polyline points="3 3 3 9 9 9"></polyline></svg>
                                    </button>
                                </div>
                            </td>`
   }

   classTableBody.appendChild(row)
})
}


loadAllClass()

//-----------------Thêm hành động vào nút xóa, khôi phục, cập nhật
document.querySelector('.table tbody').addEventListener('click', async (e) => {

    const deleteBtn = e.target.closest('.btn-icon.danger');
    const restoreBtn = e.target.closest('.btn-icon.restore');

    // Không bấm đúng nút Xóa/Khôi phục nào cả
    if (!deleteBtn && !restoreBtn) return;

    if (deleteBtn) {
      

        if (!confirm(`Bạn có chắc muốn xóa lớp "${deleteBtn.dataset.name}"?`)) return;

        deleteBtn.disabled = true;   

        try {
            await apiFetch(`/classes/${deleteBtn.dataset.id}`, 'DELETE');
            await loadAllClass();
        } catch (err) {
            alert(err.message);  
        } finally {
            deleteBtn.disabled = false;
        }
        return;
    }

    if (restoreBtn) {
       

        if (!confirm(`Bạn có chắc chắn muốn khôi phục lớp "${restoreBtn.dataset.name}"?`)) return;

        restoreBtn.disabled = true;

        try {
            await apiFetch(`/classes/${restoreBtn.dataset.id}`, 'PATCH');
            await loadAllClass();
        } catch (err) {
            alert(err.message);
        } finally {
            restoreBtn.disabled = false;
        }
    }
});


//-----------------------------------Lọc lớp theo các điều kiện

filterDepartment.addEventListener('change', (e) => {
    loadAllClass(searchInput.value, filterYear.value, filterStatus.value, filterDepartment.value)
})
filterStatus.addEventListener('change', (e) => {
    loadAllClass(searchInput.value, filterYear.value, filterStatus.value, filterDepartment.value)
})
searchInput.addEventListener('input', (e) => {
    loadAllClass(searchInput.value, filterYear.value, filterStatus.value, filterDepartment.value)
})

filterYear.addEventListener('change', (e) => {
    loadAllClass(searchInput.value, filterYear.value, filterStatus.value, filterDepartment.value)
})

})