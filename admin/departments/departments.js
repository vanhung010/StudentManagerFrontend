// departments.js
// Xử lý UI: mở/đóng modal Thêm Khoa. Logic gọi API thật (GET/POST/PUT/DELETE
// /api/departments) sẽ nối vào sau khi api.js hoàn chỉnh.

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('departmentModal');
    const btnAdd = document.getElementById('btnAddDepartment');
    const btnClose = document.getElementById('closeModal');
    const btnCancel = document.getElementById('cancelModal');
    const btnSave = document.getElementById('saveDepartment');
    const searchInput = document.querySelector('.table-toolbar input');
    const statusFilter = document.getElementById('statusFilter');

    let currentKeyword = '';
    let editingId = null;

    let currentPage = 0;
    const numberSize = 5;
    
    function openModal(mode = 'create', dept = null) {

    const form = document.getElementById('departmentForm'); //Thẻ from
    const title = document.getElementById('modalTitle');

    if(mode === 'edit'){
        editingId = dept.id;
        title.textContent = "Sửa khoa";

        document.getElementById('departmentCode').value = dept.departmentCode;
        document.getElementById('departmentName').value = dept.name; //Tự động điền giá trị khoa ban đầu

    }
    else {
         editingId = null;
        title.textContent = 'Thêm Khoa mới';
        form.reset();
    }

        modal.classList.remove('hidden');
    }

    function closeModal() {
        modal.classList.add('hidden');
        document.getElementById('departmentForm').reset();
        editingId = null;
    }


    //Gắn event nút sửa
    document.querySelector(".table tbody").addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-icon:not(.danger):not(.success)')

         if (!btn || !btn.dataset.id) return;
        

            openModal('edit', {
        id: btn.dataset.id,
        departmentCode: btn.dataset.code,
        name: btn.dataset.name
        })
    })

    //Gắn event nút xóa
    document.querySelector(".table tbody").addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-icon.danger')

        if(!btn || !btn.dataset.id) return;
        if (!confirm('Bạn có chắc muốn xóa khoa này?')) return;

       apiFetch(`/departments/${btn.dataset.id}`, "DELETE").then(() => loadDepartments(currentPage, statusFilter.value, currentKeyword))

    
    })


    //Gắn event nút khôi phục
    document.querySelector(".table tbody").addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-icon.success');

         if(!btn || !btn.dataset.id) return;
        if (!confirm('Bạn có chắc muốn khôi phục khoa này?')) return;

        apiFetch(`/departments/${btn.dataset.id}`, "PATCH").then(() => loadDepartments(currentPage, statusFilter.value, currentKeyword))
    })

    btnAdd.addEventListener('click', openModal);
    btnClose.addEventListener('click', closeModal);
    btnCancel.addEventListener('click', closeModal);

    // Đóng modal khi bấm ra ngoài vùng trắng
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });


    btnSave.addEventListener('click', async () => {
        const code = document.getElementById('departmentCode').value.trim();
        const name = document.getElementById('departmentName').value.trim();

        if (!code || !name) {
            alert('Vui lòng nhập đầy đủ Mã Khoa và Tên Khoa');
            return;
        }

        btnSave.disabled = true;
        btnSave.textContent = 'Đang lưu'

        try {
           if(editingId){
            await apiFetch(`/departments/${editingId}`, "PUT", { departmentCode: code, name: name });
           }
           else {
            await apiFetch("/departments", "POST", { departmentCode: code, name: name });
           }
           closeModal();
           loadDepartments(0, statusFilter.value, currentKeyword);
        }
        catch(err){
            alert(err.message)
        }
        finally {
            btnSave.disabled = false;
            btnSave.textContent = "Lưu";
           
        }
});

    async function loadDepartments(page = 0, status = "active", keyword = ''){
        try {
            currentKeyword = keyword;
            const query = keyword ? `&keyword=${encodeURIComponent(keyword)}` : '';
            const res = await apiFetch(`/departments?status=${status}&page=${page}&size=${numberSize}${query}`);
            currentPage = page;
            renderTable(res.data.content);

            updateTotalDepartment(res.data.totalElement);
            renderPagination(res.data.currentPage, res.data.totalPages, res.data.totalElements, res.data.pageSize);
            
        }
        catch(err){
            console.log(err.message);
        }
    }

    function renderPagination(currentPage, totalPages, totalElements, pageSize){
         
         
         //số page hiển thị
         const from  = totalElements === 0 ? 0 : currentPage * pageSize + 1;
         const to = Math.min((currentPage + 1) * pageSize, totalElements);

          document.querySelector('.pagination span').textContent =
            `Hiển thị ${from}-${to} trong ${totalElements} mục`;

        const control = document.querySelector('.pagination-controls');
        control.innerHTML = '';

        //Nút trước
        const btnPrev = document.createElement('button')
        btnPrev.textContent = "Trước";
        btnPrev.disabled = currentPage === 0;
        btnPrev.addEventListener('click', () => {
            loadDepartments(currentPage - 1, statusFilter.value, currentKeyword);
        })
        control.appendChild(btnPrev);
        //Các nút số trang
        for(let i = 0; i < totalPages; i++){
            const btnPage = document.createElement('button');
            btnPage.textContent = i+1;
            if(i === currentPage ) {
                btnPage.classList.add('active');
            }

            btnPage.addEventListener('click', () => loadDepartments(i, statusFilter.value, currentKeyword));
            control.appendChild(btnPage);
        }
        //Nút "Tiếp"
        const btnNext = document.createElement('button');
        btnNext.textContent = 'Tiếp';
        btnNext.disabled = currentPage >= totalPages - 1;
        btnNext.addEventListener('click', () => loadDepartments(currentPage + 1, statusFilter.value, currentKeyword));
        control.appendChild(btnNext);
    }



    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const keyword = searchInput.value.trim();
            loadDepartments(0, statusFilter.value, keyword);
        }, 300 )
    })


    function renderTable(departments){
        const tbody = document.querySelector(".table tbody");
        tbody.innerHTML ='';

        departments.forEach(dept => {
            const row = document.createElement('tr');
            if(!dept.isDeleted){
            row.innerHTML = `
             <td><strong>${dept.departmentCode}</strong></td>
                            <td class="text-primary-color">${dept.name}</td>
                            <td>450</td>
                            <td>45</td>
                             <td><span class="badge badge-success">Đang hoạt động</span></td>
                            <td class="col-actions">
                                <button class="btn-icon" title="Sửa" data-id="${dept.id}" data-code="${dept.departmentCode}" data-name="${dept.name}">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z"></path></svg>
                                </button>
                                <button class="btn-icon danger" title="Xóa" data-id="${dept.id}">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                </button>
                            </td>
            `;}
            else {
                row.classList.add('row-deleted');
                row.innerHTML = `
                <td><strong>${dept.departmentCode}</strong></td>
        <td class="text-primary-color">${dept.name}</td>
        <td>150</td>
        <td>15</td>
        <td><span class="badge badge-danger">Đã xóa</span></td>
        <td class="col-actions">
            <button class="btn-icon" title="Sửa">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z"></path></svg>
            </button>
            <button class="btn-icon success" title="Khôi phục" data-id="${dept.id}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"></path><polyline points="3 4 3 9 8 9"></polyline></svg>
            </button>
        </td> `
            }
            tbody.appendChild(row);
        })
    }

    function updateTotalDepartment(number){
        document.querySelector("#total-department").textContent = number;
    }

    statusFilter.addEventListener('change', () => {
        loadDepartments(0, statusFilter.value, currentKeyword);
    });

    loadDepartments(0, statusFilter.value, currentKeyword);
});
