// ============================================================
// COURSES.JS
// THÊM: giao diện danh sách + modal Thêm/Sửa + Xóa mềm/Khôi phục.
// Pattern được giữ đồng nhất với Department / Class / Teacher.
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {

    // --------------------------------------------------------
    // DOM ELEMENTS
    // --------------------------------------------------------
    const modal = document.getElementById('courseModal');
    const modalTitle = document.getElementById('modalTitle');
    const courseForm = document.getElementById('courseForm');

    const btnAdd = document.getElementById('btnAddCourse');
    const btnClose = document.getElementById('closeModal');
    const btnCancel = document.getElementById('cancelModal');
    const btnSave = document.getElementById('saveCourse');

    const inputCode = document.getElementById('courseCode');
    const inputName = document.getElementById('courseName');
    const inputCredits = document.getElementById('courseCredits');
    const inputDepartment = document.getElementById('courseDepartment');
    const inputDescription = document.getElementById('courseDescription');

    const searchInput = document.getElementById('searchInput');
    const filterDepartment = document.getElementById('filterDepartment');
    const filterStatus = document.getElementById('filterStatus');
    const courseTableBody = document.getElementById('courseTableBody');

    const paginationSummary = document.getElementById('paginationSummary');
    const paginationControls = document.getElementById('paginationControls');

    // --------------------------------------------------------
    // STATE
    // --------------------------------------------------------
    let editingId = null;
    let currentPage = 0;
    const pageSize = 5;
    let currentKeyword = '';

    // --------------------------------------------------------
    // HELPERS
    // --------------------------------------------------------
    function escapeHtml(value) {
        return String(value ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    function getDepartmentId(course) {
        return course.departmentId
            ?? course.idDepartment
            ?? course.department?.id
            ?? '';
    }

    function getDepartmentName(course) {
        return course.departmentName
            ?? course.department?.name
            ?? '';
    }

    // --------------------------------------------------------
    // MODAL
    // --------------------------------------------------------
    function resetForm() {
        courseForm.reset();
        editingId = null;
        modalTitle.textContent = 'Thêm Môn học';
        btnSave.textContent = 'Lưu Môn học';
    }

    function openAddModal() {
        resetForm();
        modal.classList.remove('hidden');
        inputCode.focus();
    }

    function openEditModal(course) {
        // THÊM: dùng cùng một modal cho cả Thêm và Sửa.
        editingId = course.id;
        modalTitle.textContent = 'Sửa Môn học';

        inputCode.value = course.courseCode ?? '';
        inputName.value = course.name ?? '';
        inputCredits.value = course.credits ?? '';
        inputDepartment.value = getDepartmentId(course);
        inputDescription.value = course.description ?? '';

        modal.classList.remove('hidden');
        inputName.focus();
    }

    function closeModal() {
        modal.classList.add('hidden');
        resetForm();
    }

    btnAdd.addEventListener('click', openAddModal);
    btnClose.addEventListener('click', closeModal);
    btnCancel.addEventListener('click', closeModal);

    modal.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
    });

    // --------------------------------------------------------
    // LOAD DEPARTMENTS
    // --------------------------------------------------------
    async function loadDepartments() {
        try {
            const res = await apiFetch('/departments?status=active&page=0&size=100');
            const departments = res?.data?.content ?? [];

            populateDepartmentSelect(filterDepartment, departments, 'Tất cả Khoa');
            populateDepartmentSelect(inputDepartment, departments, 'Chọn Khoa quản lý');
        } catch (error) {
            console.error('Không thể tải danh sách khoa:', error);
            showToast('Không thể tải danh sách khoa', 'error');
        }
    }

    function populateDepartmentSelect(select, departments, placeholder) {
        select.innerHTML = '';

        const firstOption = document.createElement('option');
        firstOption.value = '';
        firstOption.textContent = placeholder;
        select.appendChild(firstOption);

        departments.forEach((department) => {
            const option = document.createElement('option');
            option.value = department.id;
            option.textContent = department.name;
            select.appendChild(option);
        });
    }

    // --------------------------------------------------------
    // SAVE / UPDATE
    // --------------------------------------------------------
    btnSave.addEventListener('click', async () => {
        if (!courseForm.reportValidity()) return;

        const payload = {
            courseCode: inputCode.value.trim(),
            name: inputName.value.trim(),
            credits: Number(inputCredits.value),
            idDepartment: Number(inputDepartment.value),
            description: inputDescription.value.trim()
        };

        btnSave.disabled = true;
        btnSave.textContent = 'Đang lưu...';

        try {
            if (editingId) {
                // THÊM: PUT khi đang sửa.
                await updateCourse(editingId, payload);
                showToast('Cập nhật môn học thành công');
            } else {
                // THÊM: POST khi tạo mới.
                await saveCourse(payload);
                showToast('Thêm môn học thành công');
            }

            closeModal();
            await loadAllCourses(0);
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            btnSave.disabled = false;
            btnSave.textContent = 'Lưu Môn học';
        }
    });

    // --------------------------------------------------------
    // LOAD TABLE
    // --------------------------------------------------------
    async function loadAllCourses(page = 0) {
        currentKeyword = searchInput.value.trim();

        try {
            const response = await getAllCourses(
                currentKeyword,
                filterStatus.value,
                filterDepartment.value,
                page,
                pageSize
            );

            const pageData = response?.data ?? {};
            const content = pageData.content ?? [];

            // THÊM: tránh giữ currentPage vượt quá số trang sau khi xóa.
            if (content.length === 0 && page > 0 && page >= (pageData.totalPages ?? 0)) {
                currentPage = Math.max(0, (pageData.totalPages ?? 1) - 1);
                if (currentPage !== page) {
                    return loadAllCourses(currentPage);
                }
            }

            currentPage = pageData.currentPage ?? 0;

            renderTable(content);
            renderPagination(
                pageData.currentPage ?? 0,
                pageData.totalPages ?? 0,
                pageData.totalElements ?? 0,
                pageData.pageSize ?? pageSize
            );
        } catch (error) {
            console.error(error);
            courseTableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="table-empty">
                        Không thể tải danh sách môn học.
                    </td>
                </tr>
            `;
            paginationSummary.textContent = 'Không có dữ liệu';
            paginationControls.innerHTML = '';
            showToast(error.message, 'error');
        }
    }

    // --------------------------------------------------------
    // RENDER TABLE
    // --------------------------------------------------------
    function renderTable(courses) {
        courseTableBody.innerHTML = '';

        if (!courses.length) {
            courseTableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="table-empty">
                        Không tìm thấy môn học phù hợp.
                    </td>
                </tr>
            `;
            return;
        }

        courses.forEach((course) => {
            const isDeleted = Boolean(course.isDeleted);
            const row = document.createElement('tr');

            if (isDeleted) row.classList.add('row-deleted');

            row.innerHTML = `
                <td>
                    <strong class="course-code">${escapeHtml(course.courseCode)}</strong>
                </td>
                <td>
                    <span class="course-name">${escapeHtml(course.name)}</span>
                </td>
                <td>
                    <span class="course-credits">${escapeHtml(course.credits)}</span>
                </td>
                <td>${escapeHtml(getDepartmentName(course))}</td>
                    <td class="course-status-cell">
                    ${isDeleted
                        ? '<span class="badge badge-danger">Đã xóa</span>'
                        : '<span class="badge badge-success">Đang hoạt động</span>'}
                </td>
                <td class="col-actions">
                    <div class="action-buttons">
                        ${isDeleted ? `
                            <button
                                type="button"
                                class="btn-icon success restore"
                                title="Khôi phục"
                                data-id="${course.id}"
                                data-name="${escapeHtml(course.name)}">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M3 12a9 9 0 1 0 3-6.7"></path>
                                    <polyline points="3 4 3 9 8 9"></polyline>
                                </svg>
                            </button>
                        ` : `
                            <button
                                type="button"
                                class="btn-icon update"
                                title="Sửa"
                                data-id="${course.id}">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1-1-4 8.5-8.5Z"></path>
                                </svg>
                            </button>
                            <button
                                type="button"
                                class="btn-icon danger delete"
                                title="Xóa"
                                data-id="${course.id}"
                                data-name="${escapeHtml(course.name)}">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                </svg>
                            </button>
                        `}
                    </div>
                </td>
            `;

            courseTableBody.appendChild(row);
        });
    }

    // --------------------------------------------------------
    // ACTIONS: EDIT / DELETE / RESTORE
    // --------------------------------------------------------
    courseTableBody.addEventListener('click', async (event) => {
        const updateButton = event.target.closest('.btn-icon.update');
        const deleteButton = event.target.closest('.btn-icon.delete');
        const restoreButton = event.target.closest('.btn-icon.restore');

        if (!updateButton && !deleteButton && !restoreButton) return;

        const button = updateButton || deleteButton || restoreButton;
        const id = Number(button.dataset.id);

        try {
            if (updateButton) {
                // THÊM: lấy dữ liệu chi tiết trước khi mở modal.
                const response = await apiFetch(`/courses/${id}`);
                openEditModal(response.data);
                return;
            }

            if (deleteButton) {
                const name = deleteButton.dataset.name || 'môn học này';
                if (!confirm(`Bạn có chắc muốn xóa môn học "${name}"?`)) return;

                deleteButton.disabled = true;
                await deleteCourse(id);
                showToast('Xóa môn học thành công');
                await loadAllCourses(currentPage);
                return;
            }

            if (restoreButton) {
                const name = restoreButton.dataset.name || 'môn học này';
                if (!confirm(`Bạn có chắc muốn khôi phục môn học "${name}"?`)) return;

                restoreButton.disabled = true;
                await restoreCourse(id);
                showToast('Khôi phục môn học thành công');
                await loadAllCourses(currentPage);
            }
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            if (button) button.disabled = false;
        }
    });

    // --------------------------------------------------------
    // PAGINATION
    // --------------------------------------------------------
    function renderPagination(page, totalPages, totalElements, size) {
        const from = totalElements === 0 ? 0 : page * size + 1;
        const to = Math.min((page + 1) * size, totalElements);

        paginationSummary.textContent =
            `Hiển thị ${from}-${to} của ${totalElements} môn học`;

        paginationControls.innerHTML = '';

        if (totalPages <= 1) return;

        const createPageButton = (label, disabled, active, handler) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = label;
            button.disabled = disabled;
            if (active) button.classList.add('active');
            button.addEventListener('click', handler);
            return button;
        };

        paginationControls.appendChild(
            createPageButton('‹', page === 0, false, () => {
                loadAllCourses(page - 1);
            })
        );

        for (let i = 0; i < totalPages; i += 1) {
            // THÊM: rút gọn pagination khi có quá nhiều trang.
            if (totalPages > 7 && i > 1 && i < totalPages - 2 && Math.abs(i - page) > 1) {
                if (!paginationControls.querySelector('.pagination-ellipsis')) {
                    const ellipsis = document.createElement('span');
                    ellipsis.className = 'pagination-ellipsis';
                    ellipsis.textContent = '...';
                    paginationControls.appendChild(ellipsis);
                }
                continue;
            }

            paginationControls.appendChild(
                createPageButton(String(i + 1), false, i === page, () => {
                    loadAllCourses(i);
                })
            );
        }

        paginationControls.appendChild(
            createPageButton('›', page >= totalPages - 1, false, () => {
                loadAllCourses(page + 1);
            })
        );
    }

    // --------------------------------------------------------
    // FILTERS / SEARCH
    // --------------------------------------------------------
    filterStatus.addEventListener('change', () => loadAllCourses(0));
    filterDepartment.addEventListener('change', () => loadAllCourses(0));

    let searchTimer;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => loadAllCourses(0), 300);
    });

    // --------------------------------------------------------
    // INIT
    // --------------------------------------------------------
    await loadDepartments();
    await loadAllCourses(0);
});
