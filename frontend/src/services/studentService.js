import api from '@/config/axiosConfig';

const createStudent = async (data) => {
    try {
        const response = await api.post('/students', data);
        return response;
    } catch (error) {
        return error.response;
    }
};

const getAllStudents = async (params) => {
    try {
        const response = await api.get('/students', { params });
        return response;
    } catch (error) {
        return error.response;
    }
};

const updateStudent = async (id, data) => {
    try {
        const response = await api.patch(`/students/${id}`, data);
        return response;
    } catch (error) {
        return error.response;
    }
};

const bulkUpdateStudents = async (data) => {
    try {
        const response = await api.post('/students/bulk-update', data);
        return response;
    } catch (error) {
        return error.response;
    }
};

const uploadProfilePicture = async (id, formData) => {
    try {
        const response = await api.post(`/students/${id}/profile-picture`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response;
    } catch (error) {
        return error.response;
    }
};

const getIDCard = async (id, studentName) => {
    try {
        const response = await api.get(`/students/${id}/id-card`, {
            responseType: 'blob'
        });

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `id-card-${studentName || id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();

        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

const studentService = {
    createStudent,
    getAllStudents,
    updateStudent,
    bulkUpdateStudents,
    uploadProfilePicture,
    getIDCard
};

export default studentService;
