import api from '@/config/axiosConfig';

const applyLeave = async (data) => {
    try {
        const response = await api.post('/leaves/apply', data);
        return response;
    } catch (error) {
        console.error('Apply leave error:', error);
        return error.response;
    }
};

const getMyLeaves = async () => {
    try {
        const response = await api.get('/leaves/my-leaves');
        return response;
    } catch (error) {
        console.error('Get my leaves error:', error);
        return error.response;
    }
};

// Admin use
const getAllLeaves = async (params) => {
    try {
        const response = await api.get('/leaves', { params });
        return response;
    } catch (error) {
        console.error('Get all leaves error:', error);
        return error.response;
    }
};

const updateLeaveStatus = async (id, status) => {
    try {
        const response = await api.patch(`/leaves/${id}/status`, { status });
        return response;
    } catch (error) {
        console.error('Update leave status error:', error);
        return error.response;
    }
};

const leaveService = {
    applyLeave,
    getMyLeaves,
    getAllLeaves,
    updateLeaveStatus
};

export default leaveService;
