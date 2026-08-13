// ============================================================
// COURSE SERVICE
// THÊM: API cho module Môn học.
// ============================================================

// THÊM: lấy danh sách môn học có tìm kiếm, lọc khoa, lọc trạng thái và phân trang.
function getAllCourses(
    keyword = '',
    status = 'active',
    departmentId = '',
    page = 0,
    size = 5
) {
    const params = new URLSearchParams({
        status,
        page,
        size
    });

    if (keyword) params.append('keyword', keyword);
    if (departmentId) params.append('departmentId', departmentId);

    return apiFetch(`/courses?${params.toString()}`);
}

// THÊM: tạo môn học mới.
function saveCourse(payload) {
    return apiFetch('/courses', 'POST', payload);
}

// THÊM: cập nhật môn học.
function updateCourse(id, payload) {
    return apiFetch(`/courses/${id}`, 'PUT', payload);
}

// THÊM: xóa mềm môn học.
function deleteCourse(id) {
    return apiFetch(`/courses/${id}`, 'DELETE');
}

// THÊM: khôi phục môn học đã xóa.
function restoreCourse(id) {
    return apiFetch(`/courses/${id}`, 'PATCH');
}
