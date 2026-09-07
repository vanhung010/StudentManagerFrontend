// Lấy danh sách lớp học phần có phân trang và bộ lọc.
function getAllCourseSection(
    page = 0,
    size = 20,
    semesterId = '',
    courseId = '',
    teacherId = '',
    status = ''
) {
    const params = new URLSearchParams({
        page,
        size
    });

    if (semesterId) params.append('semesterId', semesterId);
    if (courseId) params.append('courseId', courseId);
    if (teacherId) params.append('teacherId', teacherId);
    if (status) params.append('status', status);

    return apiFetch(`/course-section?${params.toString()}`);
}

// Lưu lớp học phần mới
function saveCourseSection(payload) {
    return apiFetch('/course-section', 'POST', payload);
}

function updateCourseSectionStatus(id, status) {
    return apiFetch(`/course-sections/${id}/status`, 'PATCH', { status });
}