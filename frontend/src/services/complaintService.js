import api from '@/config/axiosConfig';

// Get all complaints (Admin/Teacher)
const getAllComplaints = async (params) => {
    try {
        const response = await api.get('/complaints', { params });
        return response;
    } catch (error) {
        return error.response;
    }
};

// Get my complaints (Parent)
const getMyComplaints = async () => {
    try {
        const response = await api.get('/complaints/my-complaints');
        return response;
    } catch (error) {
        return error.response;
    }
};

// Create complaint (Parent)
const createComplaint = async (data) => {
    try {
        const response = await api.post('/complaints/request', data);
        return response;
    } catch (error) {
        return error.response;
    }
};

// Update status (Admin/Teacher) - Assuming this route exists or will be added similar to others
// Note: user didn't explicitly share update route controller, but it's crucial for the feature.
// Keeping it generic or assuming PATCH /complaints/:id/status based on common patterns.
const updateComplaintStatus = async (id, status) => {
    try {
        // If the backend strictly follows the provided routing, update might be missing or different.
        // I will assume standard REST pattern or user might need to provide it.
        // For now, I'll keep the previous assumption: PATCH /complaints/:id/status
        const response = await api.patch(`/complaints/${id}/status`, { status });
        return response;
    } catch (error) {
        return error.response;
    }
};

const getComplaintStats = async () => {
    try {
        const response = await api.get('/complaints/stats');
        return response;
    } catch (error) {
        return error.response;
    }
};

const complaintService = {
    getAllComplaints,
    getMyComplaints,
    createComplaint,
    updateComplaintStatus,
    getComplaintStats
};

export default complaintService;
