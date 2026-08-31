// studentService.js
// Chỉ chứa các hàm GỌI API liên quan đến Student — không render UI,
// không đụng DOM. Khớp đúng tham số StudentController hiện có:
// GET /students?page&size&name&departmentId

function getAllStudent(name = '', departmentId = '', enrollmentYear = '', status = 'active', page = 0, size = 10) {
    const param = new URLSearchParams();

    if (name) param.append('name', name);
    if (departmentId) param.append('departmentId', departmentId);
    if(enrollmentYear) param.append('enrollmentYear', enrollmentYear);
    if(status) param.append('status', status);
    param.append('page', page);
    param.append('size', size);

    const query = param.toString();
    return apiFetch(`/students${query ? `?${query}` : ''}`);
}

function getStudentById(id) {
    return apiFetch(`/students/${id}`);
}

function createStudent(payload) {
    return apiFetch('/students', 'POST', payload);
}

function updateStudent(id, payload) {
    return apiFetch(`/students/${id}`, 'PUT', payload);
}
