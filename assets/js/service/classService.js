function getAllClass(keyword = '', enrollmentYear = '', status = '', idDepartment =''){

    const param = new URLSearchParams();

    if(keyword) param.append('keyword', keyword);
    if(enrollmentYear) param.append('enrollmentYear', enrollmentYear);
    if(status) param.append('status', status);
    if(idDepartment) param.append('idDepartment', idDepartment);

    const query = param.toString()

    return apiFetch(`/classes${param ? `?${param}` : ''}`);


}