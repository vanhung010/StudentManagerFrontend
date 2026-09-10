// ============================================================
// COURSE-SECTIONS.JS
// Phạm vi hiện tại: CHỈ xử lý đóng/mở modal "Mở Lớp học phần".
// Bảng danh sách, bộ lọc, phân trang đang là dữ liệu mẫu tĩnh
// trong list.html — chưa nối API.
// ============================================================

const sectionModal = document.getElementById('sectionModal');
const sectionForm = document.getElementById('sectionForm');
const modalTitle = document.getElementById('modalTitle');
const btnAddSection = document.getElementById('btnAddSection');
const closeModalBtn = document.getElementById('closeModal');
const cancelModalBtn = document.getElementById('cancelModal');
const saveSectionBtn = document.getElementById('saveSection');

const filterSemester = document.getElementById('filterSemester');
const filterCourse = document.getElementById('filterCourse');
const filterTeacher = document.getElementById('filterTeacher');
const filterStatus = document.getElementById('filterStatus');


const inputCourse = document.getElementById('sectionCourse');
const inputSemester = document.getElementById('sectionSemester');
const inputTeacher = document.getElementById('sectionTeacher');
const inputCapacity = document.getElementById('sectionCapacity');
const inputStatus = document.getElementById('sectionStatus');

function resetForm() {
    sectionForm.reset();
    inputStatus.value = 'Đang mở';
    modalTitle.textContent = 'Mở Lớp học phần mới';
}

function openModal() {
    resetForm();
    sectionModal.classList.remove('hidden');
    inputCourse.focus();
}

function closeModal() {
    sectionModal.classList.add('hidden');
    resetForm();
}

btnAddSection.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', closeModal);
cancelModalBtn.addEventListener('click', closeModal);

// Bấm ra ngoài modal (lên phần overlay mờ) cũng đóng lại
sectionModal.addEventListener('click', (e) => {
    if (e.target === sectionModal) closeModal();
});

// Nhấn phím Esc để đóng modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !sectionModal.classList.contains('hidden')) {
        closeModal();
    }
});

saveSectionBtn.addEventListener('click', () => {
    try {
    if (!sectionForm.reportValidity()) return;
    saveSectionBtn.textContent= 'Đang lưu';
    saveSectionBtn.disabled = true;
    const payload = {
        courseId: inputCourse.value,
        semesterId: inputSemester.value,
        teacherId: inputTeacher.value,
        maxStudents: Number(inputCapacity.value),
    };
    saveCourseSection(payload)
    }
    catch(e){
        alert(e.message)
    }
    finally{
         saveSectionBtn.textContent = "Lưu lớp học phần";
    saveSectionBtn.disabled = false;
        closeModal();
    }
  
   
});

const paginationControls = document.getElementById('paginationControls');
const paginationSummary = document.querySelector('.pagination > span');
const sectionTableBody = document.getElementById('sectionTableBody');
const pageSize = 20;
let currentPage = 0;

function getStatusLabel(status) {
    return {
        OPEN: 'Đang mở',
        CLOSED: 'Đã đóng',
        CANCELLED: 'Đã hủy'
    }[status] || status || '';
}

function getStatusBadgeClass(status) {
    return {
        OPEN: 'badge-success',
        CLOSED: 'badge-info',
        CANCELLED: 'badge-danger'
    }[status] || 'badge-secondary';
}

function renderSectionRows(sections) {
    if (!sections.length) {
        sectionTableBody.innerHTML = '<tr><td colspan="7" class="text-muted">Không có lớp học phần phù hợp.</td></tr>';
        return;
    }

    sectionTableBody.innerHTML = sections.map((section) => {
        let actionButtons;

        const updateButton = `
            <button class="btn-icon update" title="Sửa" data-id="${section.id}" data-name="${section.sectionCode}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z"></path></svg>
            </button>`;
        const cancelButton = `
            <button class="btn-icon danger cancel-section" title="Hủy lớp học phần" data-id="${section.id}" data-name="${section.sectionCode}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
            </button>`;

        if (section.status === 'OPEN') {
            actionButtons = `${updateButton}
                <button class="btn-icon close-section" title="Đóng lớp" data-id="${section.id}" data-name="${section.sectionCode}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </button>${cancelButton}`;
        } else if (section.status === 'CLOSED') {
            actionButtons = `${updateButton}
                <button class="btn-icon reopen-section" title="Mở lại" data-id="${section.id}" data-name="${section.sectionCode}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>
                </button>${cancelButton}`;
        } else {
            actionButtons = `
                <button class="btn-icon restore" title="Khôi phục" data-id="${section.id}" data-name="${section.sectionCode}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"></path><polyline points="3 3 3 9 9 9"></polyline></svg>
                </button>`;
        }

        return `
        <tr class="row-clickable" data-id="${section.id}" data-code="${section.sectionCode}">
            <td><strong>${section.sectionCode || ''}</strong></td>
            <td>${section.courseName || ''}</td>
            <td>
                <div class="teacher-cell">
                    <span>${section.teacherName || ''}</span>
                </div>
            </td>
            <td class="text-muted">${section.semesterName || ''}</td>
            <td class="col-enrollment">
                <span class="enrollment-text">${section.enrolledCount ?? 0}<span class="enrollment-sep">/</span>${section.maxStudents ?? 0}</span>
            </td>
            <td class="status-cell"><span class="badge ${getStatusBadgeClass(section.status)} status-badge">${getStatusLabel(section.status)}</span></td>
            <td class="col-actions">
                <div class="action-buttons">${actionButtons}</div>
            </td>
        </tr>
    `;
    }).join('');
}

function renderPagination(page, totalPages, totalElements, size) {
    const from = totalElements === 0 ? 0 : page * size + 1;
    const to = Math.min((page + 1) * size, totalElements);
    paginationSummary.textContent = `Hiển thị ${from}-${to} của ${totalElements} kết quả`;
    paginationControls.innerHTML = '';

    if (totalPages <= 1) return;

    const previousButton = document.createElement('button');
    previousButton.textContent = '‹ Trước';
    previousButton.disabled = page === 0;
    previousButton.dataset.page = page - 1;
    paginationControls.appendChild(previousButton);

    for (let pageNumber = 0; pageNumber < totalPages; pageNumber += 1) {
        const pageButton = document.createElement('button');
        pageButton.textContent = pageNumber + 1;
        pageButton.dataset.page = pageNumber;
        pageButton.classList.toggle('active', pageNumber === page);
        paginationControls.appendChild(pageButton);
    }

    const nextButton = document.createElement('button');
    nextButton.textContent = 'Sau ›';
    nextButton.disabled = page >= totalPages - 1;
    nextButton.dataset.page = page + 1;
    paginationControls.appendChild(nextButton);
}

async function loadAllCourseSections(page = 0) {
    try {
        const response = await getAllCourseSection(
            page,
            pageSize,
            filterSemester.value,
            filterCourse.value,
            filterTeacher.value,
            filterStatus.value
        );
        const { success, message, data: pageData } = response;
        if (!success || !pageData) {
            throw new Error(message || 'Không thể tải danh sách lớp học phần.');
        }

        currentPage = pageData.currentPage ?? page;
        renderSectionRows(pageData.content || []);
        renderPagination(
            currentPage,
            pageData.totalPages ?? 0,
            pageData.totalElements ?? 0,
            pageData.pageSize ?? pageSize
        );
    } catch (e) {
        sectionTableBody.innerHTML = '<tr><td colspan="7" class="text-muted">Không thể tải danh sách lớp học phần.</td></tr>';
        alert(e.message);
    }
}

paginationControls.addEventListener('click', (e) => {
    const button = e.target.closest('button');
    if (!button || button.disabled || button.dataset.page === undefined) return;
    loadAllCourseSections(Number(button.dataset.page));
});

document.getElementById('btnFilter').addEventListener('click', () => {
    loadAllCourseSections(0);
});


async function loadDataSelect() {
    try {
        const [allCourseResponse, allSemesterResponse, allTeacherResponse] = await Promise.all([
            getAllCourses('', 'active', '', 0, 10000),
            getAllSemester('', '', 0, 1000),
            getAllTeacher('', 'active', '', 0, 10000)
        ]);

        const allCourseData = allCourseResponse.data.content;
        const allSemesterData = allSemesterResponse.data.content;
        const allTeacherData = allTeacherResponse.data.content;

        function populateSelect(select, data, labelKey, placeholder) {
            const currentValue = select.value;
            select.innerHTML = `<option value="">${placeholder}</option>`;

            data.forEach((item) => {
                const option = document.createElement('option');
                option.value = item.id;
                option.textContent = item[labelKey];
                option.dataset.departmentid = item.departmentId;
                select.appendChild(option);
            });

            select.value = data.some((item) => String(item.id) === currentValue)
                ? currentValue
                : '';
        }

        filterCourse.innerHTML = '<option value="">Tất cả môn học</option>';
        inputCourse.innerHTML = '<option value="">Chọn môn học...</option>';
        filterSemester.innerHTML = '<option value="">Tất cả học kỳ</option>';
        inputSemester.innerHTML = '<option value="">Chọn học kỳ...</option>';
        filterTeacher.innerHTML = '<option value="">Tất cả giảng viên</option>';
        inputTeacher.innerHTML = '<option value="">Chọn giảng viên...</option>';

        populateSelect(filterCourse, allCourseData, 'name', 'Tất cả môn học');
        populateSelect(inputCourse, allCourseData, 'name', 'Chọn môn học...');
        populateSelect(filterSemester, allSemesterData, 'name', 'Tất cả học kỳ');
        populateSelect(inputSemester, allSemesterData, 'name', 'Chọn học kỳ...');
        populateSelect(filterTeacher, allTeacherData, 'fullName', 'Tất cả giảng viên');
        populateSelect(inputTeacher, allTeacherData, 'fullName', 'Chọn giảng viên...');

        let isSyncing = false;

        inputCourse.addEventListener('change', async () => {
            if (isSyncing) return;

            const departmentId = inputCourse.selectedOptions[0]?.dataset.departmentid || '';
            try {
                const response = departmentId
                    ? await getAllTeacher('', 'active', departmentId, 0, 100)
                    : { data: { content: allTeacherData } };

                isSyncing = true;
                populateSelect(inputTeacher, response.data.content, 'fullName', 'Chọn giảng viên...');
            } catch (e) {
                alert(e.message);
            } finally {
                isSyncing = false;
            }
        });

        inputTeacher.addEventListener('change', async () => {
            if (isSyncing) return;

            const departmentId = inputTeacher.selectedOptions[0]?.dataset.departmentid || '';
            try {
                const response = departmentId
                    ? await getAllCourses('', 'active', departmentId, 0, 100)
                    : { data: { content: allCourseData } };

                isSyncing = true;
                populateSelect(inputCourse, response.data.content, 'name', 'Chọn môn học...');
            } catch (e) {
                alert(e.message);
            } finally {
                isSyncing = false;
            }
        });
    } catch (e) {
        alert(e.message);
    }
}

loadDataSelect().then(() => loadAllCourseSections());

filterSemester.addEventListener('change', () => loadAllCourseSections(0));
filterCourse.addEventListener('change', () => loadAllCourseSections(0));
filterTeacher.addEventListener('change', () => loadAllCourseSections(0));
filterStatus.addEventListener('change', () => loadAllCourseSections(0));

sectionTableBody.addEventListener('click', async (e) => {
    const actionButton = e.target.closest('.action-buttons button');
    if (actionButton) {
        e.stopPropagation();

        if (actionButton.classList.contains('update')) return;

        const sectionId = actionButton.dataset.id;
        const sectionCode = actionButton.dataset.name;
        let action;
        let confirmationMessage;

        if (actionButton.classList.contains('close-section')) {
            action = closeCourseSection;
            confirmationMessage = `Bạn có chắc muốn đóng lớp học phần ${sectionCode}? Sinh viên đã đăng ký sẽ bị ảnh hưởng.`;
        } else if (actionButton.classList.contains('cancel-section')) {
            action = deletedCourseSection;
            confirmationMessage = `Bạn có chắc muốn hủy lớp học phần ${sectionCode}? Sinh viên đã đăng ký sẽ bị ảnh hưởng.`;
        } else if (actionButton.classList.contains('reopen-section')) {
            action = openCourseSection;
        } else if (actionButton.classList.contains('restore')) {
            action = restoreCourseSection;
        }

        if (!action || (confirmationMessage && !window.confirm(confirmationMessage))) return;

        try {
            actionButton.disabled = true;
            const response = await action(sectionId);
            if (!response.success) {
                throw new Error(response.message || 'Không thể cập nhật trạng thái lớp học phần.');
            }
            await loadAllCourseSections(currentPage);
        } catch (error) {
            alert(error.message);
            actionButton.disabled = false;
        }
        return;
    }

    const row = e.target.closest('tr.row-clickable');
    if (!row) return;

    const code = row.dataset.id;
    window.location.href = `detail.html?id=${encodeURIComponent(code)}`;
});
