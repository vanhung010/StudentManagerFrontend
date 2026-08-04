function getAllClass(keyword = '', enrollmentYear = '', status = '', idDepartment ='', page = 0, size = 8){

    const param = new URLSearchParams();

    if(keyword) param.append('keyword', keyword);
    if(enrollmentYear) param.append('enrollmentYear', enrollmentYear);
    if(status) param.append('status', status);
    if(idDepartment) param.append('idDepartment', idDepartment);
    param.append('page', page);
    param.append('size', size);

    const query = param.toString()

    return apiFetch(`/classes${param ? `?${param}` : ''}`);


}