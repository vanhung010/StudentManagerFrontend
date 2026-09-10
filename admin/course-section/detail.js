// ------------------------------------------------------------
// 1. CHUYỂN TAB "Sinh viên đăng ký" / "Lịch học"
// ------------------------------------------------------------
document.addEventListener('DOMContentLoaded',async () => {
const tabs = document.querySelectorAll('.section-tab');
const tabStudents = document.getElementById('tabStudents');
const tabSchedule = document.getElementById('tabSchedule');
const studentTableBody = document.getElementById('studentTableBody');
const studentPaginationSummary = document.getElementById('studentPaginationSummary');
const studentPaginationControls = document.getElementById('studentPaginationControls');



function activateTab(target) {
    const showStudents = target === 'students';
    const showSchedule = target === 'schedule';

    tabs.forEach(tab => tab.classList.toggle('active', tab.dataset.tab === target));
    tabStudents.classList.toggle('hidden', !showStudents);
    tabSchedule.classList.toggle('hidden', !showSchedule);
    tabStudents.hidden = !showStudents;
    tabSchedule.hidden = !showSchedule;
}



tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        activateTab(tab.dataset.tab);
    });
});

activateTab(document.querySelector('.section-tab.active')?.dataset.tab || 'students');

/*-----------------------------------------
2. LOAD CHI TIẾT LỚP HỌC PHẦN
-------------------------------------------*/
const sectionTitleTxt = document.getElementById('sectionTitle');
const sectionCodeTxt = document.getElementById('sectionCodeBadge');
const statusCourse = document.getElementById('statusCourse');
const statusDot = document.getElementById('statusDot');
const sectionStatusTxt = document.getElementById('sectionStatusText');
const sectionSemesterTxt = document.getElementById('sectionSemesterText');
const sectionTeacherTxt = document.getElementById('sectionTeacherText');
const enrolledCount = document.getElementById('enrolledCount');
const capacityCount = document.getElementById('capacityCount');
const remainSlotTxt = document.getElementById('remainSlotText')
const id = new URLSearchParams(window.location.search).get("id");
async function loadDetail(){
   
    const detail = await getDetailCourseSection(id);
    const dataDetail = detail.data;
     const studentRemain = dataDetail.maxStudents - dataDetail.enrolledCount;
    console.log(dataDetail);
    sectionTitleTxt.textContent = dataDetail.courseName
    sectionCodeTxt.textContent = dataDetail.sectionCode
    sectionStatusTxt.textContent = getStatusCourseSection(dataDetail.status)
    sectionSemesterTxt.textContent = dataDetail.semesterName
    sectionTeacherTxt.textContent = dataDetail.teacherName
    enrolledCount.textContent = dataDetail.enrolledCount
    capacityCount.textContent = dataDetail.maxStudents
    remainSlotTxt.textContent = `Còn ${studentRemain} chỗ`
}
loadDetail()

function getStatusCourseSection(keyword){
    if(keyword === 'OPEN'){
        statusCourse.classList.add('open')
        statusDot.classList.add('open-dot')
        return 'Đang mở'
    }
    else if(keyword === 'CLOSED'){
         statusCourse.classList.add('close')
         statusDot.classList.add('close-dot')
        return "Đang khóa";
    }
    else {
         statusCourse.classList.add('cancel')
        statusDot.classList.add('cacel-dot')
        return "Đã đóng"
    }
}


/*-----------------------------
3. LOAD DANH SÁCH HỌC SINH
------------------------*/


const studentRows = Array.from(studentTableBody.querySelectorAll('tr'));
const studentsPerPage = 10;
let currentStudentPage = 1;

function renderStudentPagination() {
    const totalStudents = studentRows.length;
    const totalPages = Math.max(1, Math.ceil(totalStudents / studentsPerPage));
    currentStudentPage = Math.min(currentStudentPage, totalPages);

    const firstStudentIndex = (currentStudentPage - 1) * studentsPerPage;
    const lastStudentIndex = Math.min(firstStudentIndex + studentsPerPage, totalStudents);

    studentRows.forEach((row, index) => {
        row.hidden = index < firstStudentIndex || index >= lastStudentIndex;
    });

    studentPaginationSummary.textContent = totalStudents
        ? `Hiển thị ${firstStudentIndex + 1}-${lastStudentIndex} của ${totalStudents} sinh viên`
        : 'Hiển thị 0-0 của 0 sinh viên';

    studentPaginationControls.innerHTML = `
        <button type="button" data-page="${currentStudentPage - 1}" ${currentStudentPage === 1 ? 'disabled' : ''}>‹ Trước</button>
        ${Array.from({ length: totalPages }, (_, index) => {
            const page = index + 1;
            return `<button type="button" class="${page === currentStudentPage ? 'active' : ''}" data-page="${page}">${page}</button>`;
        }).join('')}
        <button type="button" data-page="${currentStudentPage + 1}" ${currentStudentPage === totalPages ? 'disabled' : ''}>Sau ›</button>
    `;
}

studentPaginationControls.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-page]');
    if (!button || button.disabled) return;

    currentStudentPage = Number(button.dataset.page);
    renderStudentPagination();
});

renderStudentPagination();

// ------------------------------------------------------------
// 4. FORM "THÊM BUỔI HỌC" — ẩn/hiện + thêm dòng demo vào bảng
// ------------------------------------------------------------
const btnAddSchedule = document.getElementById('btnAddSchedule');
const scheduleAddRow = document.getElementById('scheduleAddRow');
const btnCancelSchedule = document.getElementById('btnCancelSchedule');
const btnSaveSchedule = document.getElementById('btnSaveSchedule');
const scheduleTableBody = document.getElementById('scheduleTableBody');

const scheduleDaySelect = document.getElementById('scheduleDay');
const scheduleShiftSelect = document.getElementById('scheduleShift');
const scheduleRoomInput = document.getElementById('scheduleRoom');

function resetScheduleForm() {
    scheduleDaySelect.selectedIndex = 0;
    scheduleShiftSelect.selectedIndex = 0;
    scheduleRoomInput.value = '';
}

function closeScheduleForm() {
    scheduleAddRow.classList.add('hidden');
    resetScheduleForm();
}

btnAddSchedule.addEventListener('click', () => {
    scheduleAddRow.classList.toggle('hidden');
});

btnCancelSchedule.addEventListener('click', closeScheduleForm);

btnSaveSchedule.addEventListener('click', () => {
    const day = scheduleDaySelect.value;
    const shift = scheduleShiftSelect.value;
    const room = scheduleRoomInput.value.trim();

    if (!room) {
        alert('Vui lòng nhập phòng học');
        return;
    }

    // Chỉ thêm vào bảng trên giao diện (demo) — chưa gọi API lưu thật
    const row = document.createElement('tr');
    row.innerHTML = `
        <td class="text-primary-color">${day}</td>
        <td>${shift}</td>
        <td>${room}</td>
        <td class="col-actions">
            <div class="action-buttons">
                <button class="btn-icon danger btn-delete-schedule" title="Xóa buổi học">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
            </div>
        </td>
    `;
    scheduleTableBody.appendChild(row);

    closeScheduleForm();
});

// Xóa 1 buổi học — event delegation vì các hàng có thể được thêm động
scheduleTableBody.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-delete-schedule');
    if (!btn) return;

    if (confirm('Xóa buổi học này khỏi lịch?')) {
        btn.closest('tr').remove();
    }
});
})