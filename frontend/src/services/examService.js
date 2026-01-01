import api from '@/config/axiosConfig';

/**
 * Create a new exam
 * @param {Object} data - Exam data
 * @returns {Promise<Object>} Response
 */
const createExam = async (data) => {
  try {
    const response = await api.post('/exams', data); // Assuming path is /exams based on route file
    return response;
  } catch (error) {
    return error.response;
  }
};

/**
 * Get all exams
 * @returns {Promise<Object>} Response
 */
const getExams = async (params) => {
  try {
    const response = await api.get('/exams', { params });
    return response;
  } catch (error) {
    return error.response;
  }
};

/**
 * Add exam result
 * @param {Object} data - Result data
 * @returns {Promise<Object>} Response
 */
const addExamResult = async (data) => {
  try {
    const response = await api.post('/exams/results', data);
    return response;
  } catch (error) {
    return error.response;
  }
};

/**
 * Get exam results
 * @param {Object} params - Query parameters (examId, subjectId, classId)
 * @returns {Promise<Object>} Response
 */
const getExamResults = async (params) => {
  try {
    const response = await api.get('/exams/results', { params });
    return response;
  } catch (error) {
    return error.response;
  }
};

/**
 * Get student report card
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Response
 */
const getStudentReportCard = async (params) => {
  try {
    const response = await api.get('/exams/report', { params });
    return response;
  } catch (error) {
    return error.response;
  }
};

/**
 * Update single exam result
 * @param {string} id - Result ID
 * @param {Object} data - Result data
 * @returns {Promise<Object>} Response
 */
const updateExamResult = async (id, data) => {
  try {
    const response = await api.put(`/exams/results/${id}`, data);
    return response;
  } catch (error) {
    return error.response;
  }
};

const examService = {
  createExam,
  getExams,
  addExamResult,
  updateExamResult,
  getExamResults,
  getStudentReportCard,
  getStudentExamResults: async (params) => {
    try {
      const response = await api.get('/exams/student-results', { params });
      return response;
    } catch (error) {
      return error.response;
    }
  },
  downloadReportCard: async (params) => {
    try {
      const response = await api.get('/exams/report/download', {
        params,
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      return error.response;
    }
  },
};

export default examService;
