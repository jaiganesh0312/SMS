import api from '@/config/axiosConfig';

// Admin Methods
const registerParent = async (data) => {
    try {
        const response = await api.post('/parents/register', data);
        return response;
    } catch (error) {
        return error.response;
    }
};

const getAllParents = async () => {
    try {
        const response = await api.get('/parents');
        return response;
    } catch (error) {
        return error.response;
    }
};

// Parent Methods
const getMyChildren = async () => {
    try {
        const response = await api.get('/parents/children');
        return response;
    } catch (error) {
        return error.response;
    }
};

const getChildDashboard = async (studentId) => {
    try {
        const response = await api.get(`/parents/child/${studentId}/dashboard`);
        return response;
    } catch (error) {
        return error.response;
    }
};

const parentService = {
    registerParent,
    getAllParents,
    getMyChildren,
    getChildDashboard
};

export default parentService;
