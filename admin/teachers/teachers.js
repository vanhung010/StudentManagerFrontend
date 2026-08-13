
// ---------------- Modal Thêm Giảng viên ----------------


document.addEventListener('DOMContentLoaded', async ()=> {

const pageSize = 10;
const statusFilter = document.getElementById('statusFilter');
const departmentFilter = document.getElementById('departmentFilter');
const searchInput = document.querySelector('.table-toolbar .search-box input');
const modal = document.getElementById('teacherModal');
const teacherForm = document.getElementById('teacherForm');
const btnAddTeacher = document.getElementById('btnAddTeacher');
const btnSave = document.getElementById('saveTeacher');

const teacherCodeInput = document.getElementById('teacherCode')
const fullNameInput = document.getElementById('teacherName')
const teacherEmailInput = document.getElementById('teacherEmail');
const teacherPhoneInput = document.getElementById('teacherPhone');
const departmentInputSelect = document.getElementById('teacherDepartment');
const teacherUsernameInput = document.getElementById('teacherUsername');
const teacherPasswordInput = document.getElementById('teacherPassword');

const teacherTableBody = document.getElementById('teacherTableBody')

const errorModal = document.getElementById('errorModal');
const errorModalMessage = document.getElementById('errorModalMessage');
const closeErrorModal = document.getElementById('closeErrorModal');


let currentPage = 0;
let editingId = null;

// THÊM/MODIFIED
function openModal(mode = 'create', teacher = null) {

    editingId = mode === 'edit'
        ? teacher.id
        : null;

    teacherForm.reset();

    if (editingId) {

        modalTitle.textContent = 'Sửa Giảng viên';

        teacherCodeInput.value =
            teacher.teacherCode || '';

        fullNameInput.value =
            teacher.fullName || '';

        teacherEmailInput.value =
            teacher.email || '';

        teacherPhoneInput.value =
            teacher.phoneNumber ||
            teacher.phone_number ||
            '';

        departmentInputSelect.value =
            teacher.departmentId || '';

        teacherUsernameInput.value =
            teacher.userName || '';

        // Khi sửa không hiển thị password cũ
        teacherPasswordInput.value = '';

        teacherPasswordInput.placeholder =
            'Để trống nếu không đổi mật khẩu';

        btnSave.textContent = 'Cập nhật';

    } else {

        modalTitle.textContent =
            'Thêm Giảng viên';

        teacherPasswordInput.placeholder =
            'Mật khẩu mặc định...';

        btnSave.textContent =
            'Tạo Giảng viên';
    }

    modal.classList.remove('hidden');
}

function closeModal() {
   modal.classList.add('hidden');

    teacherForm.reset();

    editingId = null;

    teacherPasswordInput.placeholder =
        'Mật khẩu mặc định...';
}

//-----MODAL báo lỗi---------------
    function showError(message) {
        errorModalMessage.textContent = message || 'Có lỗi xảy ra, vui lòng thử lại.';
        errorModal.classList.remove('hidden');
    }

    closeErrorModal.addEventListener('click', () => errorModal.classList.add('hidden'));
    errorModal.addEventListener('click', (e) => {
        if (e.target === errorModal) errorModal.classList.add('hidden');
    });

btnAddTeacher.addEventListener('click', openModal);
document.getElementById('closeModal').addEventListener('click', closeModal);
document.getElementById('cancelModal').addEventListener('click', closeModal);

// Bấm ra ngoài modal (lên overlay) cũng đóng lại
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

// ---------------- Ẩn/hiện mật khẩu ----------------
document.getElementById('togglePassword').addEventListener('click', () => {
    const passwordInput = document.getElementById('teacherPassword');
    passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
});

//--------------------------THÊM GIẢNG VIÊN------------------
//-----------------------LOAD KHOA CÒN HOẠT ĐỘNG VÀO MODAL THÊM GIẢNG VIÊN
const resDepartment = await getAllDepartments('active','', 0, 10000000,'');

const allDepartmentActive = resDepartment.data.content;


function populateSelect(elementSelect, dataItem, valueKey, labelKey, placeHolder) {
  
    elementSelect.innerHTML = `<option value=''>${placeHolder}</option>`
    dataItem.forEach(item => {
        const elementOption = document.createElement('option');

        elementOption.value = item[valueKey];
        elementOption.textContent = item[labelKey];

        elementSelect.appendChild(elementOption);
    })
}

populateSelect(departmentInputSelect, allDepartmentActive, 'id', 'name', 'Chọn khoa trực thuộc');
populateSelect(departmentFilter, allDepartmentActive, 'id', 'name', 'Tất cả khoa');
//Lưu
btnSave.addEventListener('click', async () => {

    if (!teacherForm.reportValidity()) {
        return;
    }

    // Khi tạo mới password bắt buộc
    if (!editingId &&
        !teacherPasswordInput.value.trim()) {

        showError(
            'Mật khẩu không được để trống khi tạo giảng viên'
        );

        teacherPasswordInput.focus();
        return;
    }

    const payload = {
        teacherCode:
            teacherCodeInput.value.trim(),

        fullName:
            fullNameInput.value.trim(),

        email:
            teacherEmailInput.value.trim(),

        phoneNumber:
            teacherPhoneInput.value.trim(),

        idDepartment:
            Number(departmentInputSelect.value),

        userName:
            teacherUsernameInput.value.trim()
    };


    if (!editingId ||
        teacherPasswordInput.value.trim()) {

        payload.password =
            teacherPasswordInput.value;
    }

    btnSave.disabled = true;

    try {

        if (editingId) {

            // THÊM: PUT
            await updateTeacher(
                editingId,
                payload
            );

            showToast(
                'Cập nhật giảng viên thành công'
            );

        } else {

            await saveTeacher(payload);

            showToast(
                'Tạo giảng viên thành công'
            );
        }

        closeModal();

        await loadAllTeachers(currentPage);

    } catch (err) {

        showError(err.message);

    } finally {

        btnSave.disabled = false;
    }
});

//-----------------------------LOAD Danh sách giảng viên---------------------------------
function renderPagination(page, totalPages, totalElements, size) {

    const from =
        totalElements === 0
            ? 0
            : page * size + 1;

    const to =
        Math.min(
            (page + 1) * size,
            totalElements
        );

    document.querySelector('.pagination span').textContent =
        `Hiển thị ${from}-${to} trong ${totalElements} kết quả`;

    const control =
        document.querySelector('.pagination-controls');

    control.innerHTML = '';

    // Không có dữ liệu
    if (totalPages <= 0) {
        return;
    }

    // =========================
    // NÚT TRƯỚC
    // =========================
    const btnPrev = document.createElement('button');

    btnPrev.textContent = '‹';

    btnPrev.disabled = page === 0;

    btnPrev.addEventListener('click', () => {
        if (page > 0) {
            loadAllTeachers(page - 1);
        }
    });

    control.appendChild(btnPrev);


    // =========================
    // CÁC TRANG
    // =========================
    const pages = new Set();

    pages.add(0);
    pages.add(totalPages - 1);
    pages.add(page);

    if (page > 0) {
        pages.add(page - 1);
    }

    if (page < totalPages - 1) {
        pages.add(page + 1);
    }

    const sortedPages =
        [...pages]
            .filter(p => p >= 0 && p < totalPages)
            .sort((a, b) => a - b);

    let previousPage = null;

    sortedPages.forEach(p => {

        if (
            previousPage !== null &&
            p - previousPage > 1
        ) {
            const dots =
                document.createElement('span');

            dots.textContent = '...';

            control.appendChild(dots);
        }

        const btnPage =
            document.createElement('button');

        btnPage.textContent =
            String(p + 1);

        if (p === page) {
            btnPage.classList.add('active');
        }

        btnPage.addEventListener('click', () => {
            loadAllTeachers(p);
        });

        control.appendChild(btnPage);

        previousPage = p;
    });


    // =========================
    // NÚT SAU
    // =========================
    const btnNext =
        document.createElement('button');

    btnNext.textContent = '›';

    btnNext.disabled =
        page >= totalPages - 1;

    btnNext.addEventListener('click', () => {

        if (page < totalPages - 1) {
            loadAllTeachers(page + 1);
        }

    });

    control.appendChild(btnNext);
}

function renderTable(teachers){
    teacherTableBody.innerHTML = ''
    teachers.forEach(teacher => {
        const trItem = document.createElement('tr');
        trItem.setAttribute("id", teacher.id)
        let statusHtml, iconHtml;
        if(teacher.isDeleted){
            statusHtml = ' <td><span class="badge badge-danger">Đã xóa</span></td>'
            iconHtml = ` <td class="col-actions">
                                <div class="action-buttons">
                                    <button class="btn-icon" title="Sửa" onclick="openEditModal(this)">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z"></path></svg>
                                    </button>
                                    <button class="btn-icon restore" title="Khôi phục" data-id = ${teacher.id} data-name = ${teacher.fullName}>
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
                                    <button class="btn-icon danger" title="Xóa"  data-id = ${teacher.id} data-name = ${teacher.fullName} >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                    </button>
                                </div>
                            </td>`
        }
        trItem.innerHTML = `
         <td>
                                <div class="teacher-info">
                                    <img class="avatar avatar-sm" src="https://i.pravatar.cc/64?img=12" alt="">
                                    <span>${teacher.fullName}</span>
                                </div>
                            </td>
                            <td>${teacher.teacherCode}</td>
                            <td class="text-muted">${teacher.email}</td>
                            <td>0901 234 567</td>
                           ${statusHtml}
                            <td><span class="badge badge-info">${teacher.departmentCode}</span></td>
                           ${iconHtml}
        
        `
        teacherTableBody.appendChild(trItem)
    })
}

async function loadAllTeachers(page = 0) {
    try {
        const resTeachers = await getAllTeacher(
            searchInput.value.trim(),
            statusFilter.value,
            departmentFilter.value,
            page,
            pageSize
        );

        const pageData = resTeachers.data;

        const totalPages = pageData.totalPages || 0;

        // THÊM:
        // Nếu page hiện tại vượt quá số page thực tế
        // thì tự động quay về page cuối hợp lệ.
        if (totalPages > 0 && page >= totalPages) {
            await loadAllTeachers(totalPages - 1);
            return;
        }

        currentPage = pageData.currentPage ?? 0;


        renderTable(pageData.content || []);

        renderPagination(
            currentPage,
            totalPages,
            pageData.totalElements ?? 0,
            pageData.pageSize || pageSize
        );

    } catch (err) {
        showError(err.message);
    }
}

loadAllTeachers()

departmentFilter.addEventListener('change',async () => {
    await loadAllTeachers(searchInput.value, 'active', departmentFilter.value,  currentPage)
})

statusFilter.addEventListener(
    'change',
    () => loadAllTeachers(currentPage)
);

teacherTableBody.addEventListener('click', async (e) => {

    const btn = e.target.closest('.btn-icon');

    if (!btn || !btn.dataset.id) {
        return;
    }

    const id = Number(btn.dataset.id);

    const teacher = {
        id,
        teacherCode: btn.dataset.code,
        fullName: btn.dataset.name,
        email: btn.dataset.email,
        phoneNumber: btn.dataset.phone,
        departmentId: btn.dataset.departmentId,
        userName: btn.dataset.username
    };

    try {

        // =========================
        // SỬA
        // =========================
        if (btn.classList.contains('update')) {

            openModal(
                'edit',
                teacher
            );

            return;
        }

        // =========================
        // XÓA
        // =========================
        if (btn.classList.contains('danger')) {

            if (!confirm(
                `Bạn có chắc muốn xóa giảng viên "${teacher.fullName}"?`
            )) {
                return;
            }

            // THÊM
            await deleteTeacher(id);

            showToast(
                'Xóa giảng viên thành công'
            );

            await loadAllTeachers(currentPage);

            return;
        }

        // =========================
        // KHÔI PHỤC
        // =========================
        if (btn.classList.contains('restore')) {

            if (!confirm(
                `Bạn có chắc muốn khôi phục giảng viên "${teacher.fullName}"?`
            )) {
                return;
            }

            // THÊM
            await restoreTeacher(id);

            showToast(
                'Khôi phục giảng viên thành công'
            );

            await loadAllTeachers(currentPage);
        }

    } catch (err) {

        showError(err.message);
    }
});


})