import api from '@/config/axiosConfig';


const staffAttendanceService = {
    markAttendance: async (data) => {
        const response = await api.post(`/staff-attendance/mark`, data);
        return response.data;
    },

    getAttendance: async (params) => {
        const response = await api.get(`/staff-attendance`, { params });
        return response.data;
    },

    updateAttendance: async (id, data) => {
        const response = await api.put(`/staff-attendance/${id}`, data);
        return response.data;
    }
};

export default staffAttendanceService;
