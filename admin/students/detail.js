document.addEventListener('DOMContentLoaded', async () => {

    const detailLoading = document.getElementById('detailLoading');
    const detailContent = document.getElementById('detailContent');
    const detailErrorState = document.getElementById('detailErrorState');

  
    const params = new URLSearchParams(window.location.search);
    const studentId = params.get('id');

    if (!studentId) {
        showErrorState();
        return;
    }

    try {
        const res = await getStudentById(studentId);
        renderDetail(res.data);
    } catch (err) {
        showErrorState();
    }

    function showErrorState() {
        detailLoading.classList.add('hidden');
        detailContent.classList.add('hidden');
        detailErrorState.classList.remove('hidden');
    }

    function formatDate(dateStr) {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('vi-VN');
    }

    function formatGender(gender) {
        switch (gender) {
            case 'MALE': return 'Nam';
            case 'FEMALE': return 'Nữ';
            case 'OTHER': return 'Khác';
            default: return '—';
        }
    }

    function renderDetail(student) {
        // Header card
        document.getElementById('detailAvatar').src = `https://i.pravatar.cc/128?u=${student.id}`;
        document.getElementById('detailFullName').textContent = student.fullName;
        document.getElementById('detailStudentCode').textContent = student.studentCode;
        document.getElementById('detailClassCode').textContent =
            student.classes ? student.classes.classCode : 'Chưa có lớp';
        document.getElementById('detailDepartmentName').textContent =
            student.department ? student.department.name : 'Chưa có khoa';
        document.getElementById('detailGpa').textContent =
            student.gpa !== null && student.gpa !== undefined ? student.gpa : '—';

        // Thông tin cá nhân
        document.getElementById('infoFullName').textContent = student.fullName || '—';
        document.getElementById('infoDob').textContent = formatDate(student.dob);
        document.getElementById('infoGender').textContent = formatGender(student.gender);
        document.getElementById('infoEmail').textContent = student.email || '—';
        document.getElementById('infoPhone').textContent = student.phone || '—';

        // Thông tin học vụ
        document.getElementById('infoStudentCode').textContent = student.studentCode || '—';
        document.getElementById('infoDepartment').textContent =
            student.department ? student.department.name : '—';
        document.getElementById('infoClass').textContent =
            student.classes ? student.classes.classCode : '—';
        document.getElementById('infoEnrollmentYear').textContent = student.enrollmentYear || '—';
        document.getElementById('infoGpa').textContent =
            student.gpa !== null && student.gpa !== undefined ? student.gpa : '—';

        detailLoading.classList.add('hidden');
        detailContent.classList.remove('hidden');
    }
});