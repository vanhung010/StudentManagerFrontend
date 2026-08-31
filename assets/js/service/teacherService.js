 function getAllTeacher(
    name = '',
    status = 'active',
    departmentId = '',
    page = 0,
    size = 10
) {
    const params = new URLSearchParams({
        status,
        page,
        size
    });

    if (name) {
        params.append('name', name);
    }

    if (departmentId) {
        params.append('departmentId', departmentId);
    }

    return apiFetch(`/teachers?${params.toString()}`);
}


function saveTeacher(payload){
  return apiFetch('/teachers', 'post', payload)
}

// THÊM: cập nhật Teacher
function updateTeacher(id, payload) {
    return apiFetch(`/teachers/${id}`, 'PUT', payload);
}

// THÊM: xóa mềm Teacher
function deleteTeacher(id) {
    return apiFetch(`/teachers/${id}`, 'DELETE');
}

// THÊM: khôi phục Teacher
function restoreTeacher(id) {
    return apiFetch(`/teachers/${id}/restore`, 'PATCH');
}