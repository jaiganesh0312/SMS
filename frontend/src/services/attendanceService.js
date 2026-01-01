import api from '@/config/axiosConfig';

/**
 * Mark attendance
 * @param {Object} data - Attendance data
 * @returns {Promise<Object>} Response
 */
const markAttendance = async (data) => {
  try {
    const response = await api.post('/attendance/mark', data);
    return response;
  } catch (error) {
    return error.response;
  }
};

/**
 * Get attendance report
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Response
 */
const getAttendanceReport = async (params) => {
  try {
    const response = await api.get('/attendance/report', { params });
    return response;
  } catch (error) {
    return error.response;
  }
};

const attendanceService = {
  markAttendance,
  getAttendanceReport,
  getAttendance: async (params) => {
    const response = await api.get('/attendance', { params });
    return response;
  },
  updateAttendance: async (id, data) => {
    const response = await api.put(`/attendance/${id}`, data);
    return response;
  }
};

export default attendanceService;
