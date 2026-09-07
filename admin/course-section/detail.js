// ============================================================
// DETAIL.JS — Chi tiết Lớp học phần
// Chỉ xử lý tương tác UI cơ bản, dữ liệu demo tĩnh trong HTML.
// Chưa nối API.
// ============================================================

// ------------------------------------------------------------
// 1. CHUYỂN TAB "Sinh viên đăng ký" / "Lịch học"
// ------------------------------------------------------------
const tabs = document.querySelectorAll('.section-tab');
const tabStudents = document.getElementById('tabStudents');
const tabSchedule = document.getElementById('tabSchedule');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const target = tab.dataset.tab;
        tabStudents.classList.toggle('hidden', target !== 'students');
        tabSchedule.classList.toggle('hidden', target !== 'schedule');
    });
});

// ------------------------------------------------------------
// 2. TÌM KIẾM SINH VIÊN — lọc trực tiếp trên các hàng đã có
// ------------------------------------------------------------
const studentSearchInput = document.getElementById('studentSearchInput');
const studentTableBody = document.getElementById('studentTableBody');
const studentEmptyState = document.getElementById('studentEmptyState');

studentSearchInput.addEventListener('input', () => {
    const keyword = studentSearchInput.value.trim().toLowerCase();
    const rows = studentTableBody.querySelectorAll('tr');
    let visibleCount = 0;

    rows.forEach(row => {
        const code = row.children[0].textContent.toLowerCase();
        const name = row.children[1].textContent.toLowerCase();
        const match = !keyword || code.includes(keyword) || name.includes(keyword);
        row.classList.toggle('hidden', !match);
        if (match) visibleCount++;
    });

    // Chỉ hiện empty-state khi lọc không ra kết quả nào
    studentEmptyState.classList.toggle('hidden', visibleCount > 0);
});

// ------------------------------------------------------------
// 3. FORM "THÊM BUỔI HỌC" — ẩn/hiện + thêm dòng demo vào bảng
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
