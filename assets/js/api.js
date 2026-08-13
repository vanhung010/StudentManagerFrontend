const BASE_URL = 'http://localhost:8080/api';

function getAuthHeader() {
    const credentials = sessionStorage.getItem('credentials');
    return credentials ? `Basic ${credentials}` : '';
}

async function apiFetch(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': getAuthHeader()
        }
    };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(`${BASE_URL}${endpoint}`, options);
   
    const data = await res.json();

    
    
    if (!res.ok) {
        throw new Error(data.message || 'Có lỗi xảy ra');
    }
    return data;
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('toast-hide');
        setTimeout(() => toast.remove(), 250);   
    }, 2500);   // hiện trong 2.5 giây
}