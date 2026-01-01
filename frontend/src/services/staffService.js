import api from '@/config/axiosConfig';
import authService from './authService';

const getAllStaff = async (params) => {
    try {
        const response = await api.get('/staff', { params });
        return response;
    } catch (error) {
        return error.response;
    }
};

const getStaffById = async (id) => {
    try {
        const response = await api.get(`/staff/${id}`);
        return response;
    } catch (error) {
        return error.response;
    }
};

const updateStaff = async (id, data) => {
    try {
        const response = await api.patch(`/staff/${id}`, data);
        return response;
    } catch (error) {
        return error.response;
    }
};

const deleteStaff = async (id) => {
    try {
        const response = await api.delete(`/staff/${id}`);
        return response;
    } catch (error) {
        return error.response;
    }
};

const generateOfferLetter = async (id) => {
    try {
        const response = await api.get(`/staff/${id}/offer-letter`, {
            responseType: 'blob'
        });
        return response;
    } catch (error) {
        return error.response;
    }
};

const generateJoiningLetter = async (id) => {
    try {
        const response = await api.get(`/staff/${id}/joining-letter`, {
            responseType: 'blob'
        });
        return response;
    } catch (error) {
        return error.response;
    }
};

// Create Staff (Admin only)
const createStaff = async (data) => {
    try {
        const response = await api.post('/staff', data);
        return response;
    } catch (error) {
        return error.response;
    }
};

const acceptOffer = async () => {
    try {
        const response = await api.post('/staff/accept-offer');
        return response;
    } catch (error) {
        return error.response;
    }
};

const staffService = {
    getAllStaff,
    getStaffById,
    updateStaff,
    deleteStaff,
    createStaff,
    acceptOffer,
    generateOfferLetter,
    generateJoiningLetter
};

export default staffService;
