import api from '@/config/axiosConfig';

const getSchoolStats = async () => {
    try {
        const response = await api.get('/dashboard/stats');
        return response;
    } catch (error) {
        return error.response;
    }
};

const getSystemStats = async () => {
    try {
        const response = await api.get('/dashboard/system-stats');
        return response;
    } catch (error) {
        return error.response;
    }
};

const getAllSchools = async () => {
    try {
        const response = await api.get('/dashboard/schools');
        return response;
    } catch (error) {
        return error.response;
    }
};

export default {
    getSchoolStats,
    getSystemStats,
    getAllSchools
};
