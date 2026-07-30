 function getAllTeacher(name = '', status = 'active', departmentId =''){

   const params = new URLSearchParams();

    if (name) params.append('name', name);
    if (departmentId) params.append('departmentId', departmentId);


    const query = params.toString();
   
    return apiFetch(`/teachers${query ? `?${query}` : ''}`);

    }