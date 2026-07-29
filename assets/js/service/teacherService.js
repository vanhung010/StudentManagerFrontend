 function getAllTeacher(name = '', status = 'active'){
        const query = name ? `?name=${encodeURIComponent(name)}` : '';
       return apiFetch(`/teachers${query}`);
       
    }