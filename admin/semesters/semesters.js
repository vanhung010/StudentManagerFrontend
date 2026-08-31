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

const tableSemester = document.getElementById('semesterTableBody');
const filterStatus = document.getElementById('filterStatus');
const searchInput = document.getElementById('searchInput');


const errorModal = document.getElementById('errorModal');
const errorModalMessage = document.getElementById('errorModalMessage');
const closeErrorModal = document.getElementById('closeErrorModal');


document.addEventListener('DOMContentLoaded', async() =>{
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
    await saveSemester({
        'semesterCode': semesterCodeInput.value,
        'name': semesterNameInput.value,
        'startDate': semesterStartDateInput.value,
        'endDate': semesterEndDateInput.value,
        'regStartDate': registrationOpenDateInput.value,
        'regEndDate': registrationCloseDateInput.value,
        'setAsCurrent': setCurrentToggleInput.checked
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
//-------------------------LOAD dữ liệu---------------------
function renderTableSemester(dataRender){
    tableSemester.innerHTML = '';
dataRender.forEach(item => {
    const trItem = document.createElement('tr');
    trItem.setAttribute('id', item.id);
    let statusSemester, iconAction, classActive;
    //Gán giá trị biến
    if(item.isActive){
        trItem.classList.add('row-active');
        statusSemester = '<td class="status-cell"><span class="badge badge-success status-badge">Đang hoạt động</span></td>';
        iconAction = `<td class="col-actions">
                                <div class="action-buttons">
                                    <button class="btn-icon btn-edit" title="Sửa">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z"></path></svg>
                                    </button>
                                    <button class="btn-icon danger btn-delete" title="Không thể xóa học kỳ đang hoạt động" disabled>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                    </button>
                                </div>
                            </td>`
    }
    else {
        statusSemester = '<td class="status-cell"><span class="badge badge-neutral status-badge">Đã kết thúc</span></td>';
        iconAction = ` <td class="col-actions">
                                <div class="action-buttons">
                                    <button class="btn-icon set-current" title="Đặt làm học kỳ hiện tại">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                    </button>
                                    <button class="btn-icon btn-edit" title="Sửa">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z"></path></svg>
                                    </button>
                                    <button class="btn-icon danger btn-delete" title="Xóa">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                    </button>
                                </div>
                            </td>`
    }
  
    trItem.innerHTML = `
    <td><strong>${item.semesterCode}</strong></td>
                            <td class="col-semester-name" title=${item.name}>${item.name}</td>
                            <td>${item.startDate}</td>
                            <td>${item.endDate}</td>
                            <td class="text-muted">${item.regStartDate} - ${item.regEndDate}</td>
                            ${statusSemester}
                            ${iconAction}
    `
    tableSemester.appendChild(trItem);
})

}

function renderPagination(page, totalPages, totalElements, size = 10){
    const from = totalElements === 0 ? 0 : page * size + 1;
    const to = Math.min((page + 1) * size, totalElements);

    document.querySelector('.pagination span').textContent =
        `Hiển thị ${from}-${to} trong số ${totalElements} học kì`;

    //Thanh điều khiển
    const control = document.querySelector('.pagination-controls');
    control.innerHTML = '';

    const gotoPage = (pageTarget) => {
        loadAllSemester(status = filterStatus.value, keyword = searchInput.value, pageTarget, size = 10)
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
        btnPage.addEventListener('click', () => gotoPage(p));   
        control.appendChild(btnPage);

        previousPage = p;

    })

    const btnNext = document.createElement('button');
    btnNext.textContent = '›';
    btnNext.disabled = page >= totalPages - 1;
    btnNext.addEventListener('click', () => gotoPage(page + 1));
    control.appendChild(btnNext);     
}

async function loadAllSemester(status = filterStatus.value, keyword = searchInput.value, page = 0, size = 10){
    try{
        const dataSemester = await getAllSemester(status, keyword);
        document.getElementById('totalSemester').textContent = dataSemester.data.totalElements
        renderTableSemester(dataSemester.data.content)
        renderPagination(dataSemester.data.currentPage, dataSemester.data.totalPages, dataSemester.data.totalElements)
    }
    catch(err){
        showError(err.message);
    }
}

await loadAllSemester()

//----------------------------------------------LỌC--------------------------------------
filterStatus.addEventListener('change', async () => {
    await loadAllSemester(filterStatus.value, searchInput.value, page = 0, size = 10)
})

searchInput.addEventListener('input', async () => {
        await loadAllSemester(filterStatus.value, searchInput.value, page = 0, size = 10)
})
//-------------------------------------------thêm event vào các nút icon-------------------------
tableSemester.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-icon');
    if (!btn || btn.disabled) return;

    const tr = btn.closest('tr');
    const semesterId = +tr?.id;
    if (!semesterId) return;

    if (btn.classList.contains('btn-edit')) {
        handleEditSemester(semesterId);
    } else if (btn.classList.contains('btn-delete')) {
        handleDeleteSemester(semesterId);
    } else if (btn.classList.contains('set-current')) {
        handleSetCurrentSemester(semesterId);
    }
});

function handleEditSemester(id) {
    // TODO: mở form/modal sửa, load dữ liệu học kỳ theo id
    console.log('Sửa học kỳ:', id);
}

async function handleDeleteSemester(id) {
    const confirmed = confirm('Bạn có chắc muốn xóa học kỳ này?');
    if (!confirmed) return;
    try {
        await deleteSemester(id); 
        await loadAllSemester();  
    } catch (err) {
        showError(err.message);
    }
}

async function handleSetCurrentSemester(id) {
    try {
        await setCurrentSemester(id); // gọi API set học kỳ hiện tại
        await loadAllSemester();
    } catch (err) {
        showError(err.message);
    }
}
})