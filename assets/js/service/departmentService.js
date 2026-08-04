function getAllDepartments(status = 'active', keyword = '', page = 0, size = 10, classId = '') {
    const params = new URLSearchParams({
        status,
        page,
        size
    });

    if (keyword) params.append('keyword', keyword);
    if (classId) params.append('classId', classId);

    return apiFetch(`/departments?${params.toString()}`);
}