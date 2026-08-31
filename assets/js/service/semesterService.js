function saveSemester(payload) {
    return apiFetch('/semesters', 'POST', payload);
}

function getAllSemester(status, keyword, page = 0, size = 10){
     const params = new URLSearchParams({
        status,
        page,
        size
    });

    if (keyword) params.append('keyWord', keyword);
     return apiFetch(`/semesters?${params.toString()}`);
}

function setCurrentSemester(id) {
     return apiFetch(`/semesters/${id}`, 'PATCH');
}


function deleteSemester(id){
     return apiFetch(`/semesters/${id}`, 'DELETE');
}
