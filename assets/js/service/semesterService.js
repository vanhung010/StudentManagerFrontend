function saveSemester(payload) {
    return apiFetch('/semesters', 'POST', payload);
}