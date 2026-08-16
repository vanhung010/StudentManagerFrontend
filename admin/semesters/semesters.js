// ============================================================
// SEMESTERS.JS
// Phạm vi hiện tại: CHỈ xử lý đóng/mở modal "Tạo Học kỳ".
// Bảng danh sách, bộ lọc, phân trang đang là dữ liệu mẫu tĩnh
// trong list.html — chưa nối API.
// ============================================================

const semesterModal = document.getElementById('semesterModal');
const semesterForm = document.getElementById('semesterForm');
const btnAddSemester = document.getElementById('btnAddSemester');
const closeModalBtn = document.getElementById('closeModal');
const cancelModalBtn = document.getElementById('cancelModal');
const saveSemesterBtn = document.getElementById('saveSemester');

const semesterCodeInput = document.getElementById('semesterCode');
const semesterNameInput = document.getElementById('semesterName');
const semesterStartDateInput = document.getElementById('semesterStartDate');
const semesterEndDateInput = document.getElementById('semesterEndDate');
const registrationOpenDateInput = document.getElementById('registrationOpenDate');
const registrationCloseDateInput = document.getElementById('registrationCloseDate');
const setCurrentToggleInput = document.getElementById('setCurrentToggle');


const errorModal = document.getElementById('errorModal');
const errorModalMessage = document.getElementById('errorModalMessage');
const closeErrorModal = document.getElementById('closeErrorModal');


function openModal() {
    semesterForm.reset();
    semesterModal.classList.remove('hidden');
}

function closeModal() {
    semesterModal.classList.add('hidden');
    semesterForm.reset();
}

btnAddSemester.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', closeModal);
cancelModalBtn.addEventListener('click', closeModal);

// Bấm ra ngoài modal (lên phần overlay mờ) cũng đóng lại
semesterModal.addEventListener('click', (e) => {
    if (e.target === semesterModal) closeModal();
});

// Nhấn phím Esc để đóng modal 
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !semesterModal.classList.contains('hidden')) {
        closeModal();
    }
});

 // ---------------- MODAL BÁO LỖI ----------------
function showError(message) {
        errorModalMessage.textContent = message || 'Có lỗi xảy ra, vui lòng thử lại.';
        errorModal.classList.remove('hidden');
    }

closeErrorModal.addEventListener('click', () => errorModal.classList.add('hidden'));
errorModal.addEventListener('click', (e) => {
        if (e.target === errorModal) errorModal.classList.add('hidden');
    });
//------------------------Lưu học kì mới------------------
saveSemesterBtn.addEventListener('click', async () => {
    try{
    saveSemesterBtn.disabled = true;
    saveSemesterBtn.textContent = 'Đang lưu';
    saveSemester({
        'semesterCode': semesterCodeInput.value,
        'name': semesterNameInput.value,
        'startDate': semesterStartDateInput.value,
        'endDate': semesterEndDateInput.value,
        'regStartDate': registrationOpenDateInput.value,
        'regEndDate': registrationCloseDateInput.value,
        'setAsCurrent': setCurrentToggleInput.value
    })
    }
    catch(err){
        showError(err.message)
    }
    finally {
    saveSemesterBtn.disabled = false;
    saveSemesterBtn.textContent = 'Lưu học kì';
    closeModal();
    }
})

