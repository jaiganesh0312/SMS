import api from '@/config/axiosConfig';

/**
 * Create a new fee structure
 * @param {Object} data - Fee structure data
 * @returns {Promise<Object>} Response
 */
const createFeeStructure = async (data) => {
  try {
    const response = await api.post('/finance/fees', data);
    return response;
  } catch (error) {
    console.error('Create fee structure error:', error);
    return error.response;
  }
};

/**
 * Get fee structures
 * @returns {Promise<Object>} Response
 */
const getFeeStructures = async () => {
  try {
    const response = await api.get('/finance/fees');
    return response;
  } catch (error) {
    console.error('Get fee structures error:', error);
    return error.response;
  }
};

/**
 * Collect fee
 * @param {Object} data - Payment data
 * @returns {Promise<Object>} Response
 */
const collectFee = async (data) => {
  try {
    const response = await api.post('/finance/fees/collect', data);
    return response;
  } catch (error) {
    console.error('Collect fee error:', error);
    return error.response;
  }
};

/**
 * Create payroll record
 * @param {Object} data - Payroll data
 * @returns {Promise<Object>} Response
 */
const createPayrollRecord = async (data) => {
  try {
    const response = await api.post('/finance/payroll', data);
    return response;
  } catch (error) {
    console.error('Create payroll error:', error);
    return error.response;
  }
};

/**
 * Get fee statistics for school admin dashboard
 * @returns {Promise<Object>} Response
 */
const getFeeStatistics = async () => {
  try {
    const response = await api.get('/finance/statistics');
    return response;
  } catch (error) {
    console.error('Get fee statistics error:', error);
    return error.response;
  }
};

/**
 * Get class-wise student payment status
 * @param {string} classId - Class ID
 * @returns {Promise<Object>} Response
 */
const getClassFeeStatus = async (classId) => {
  try {
    const response = await api.get(`/finance/class/${classId}/students`);
    return response;
  } catch (error) {
    console.error('Get class fee status error:', error);
    return error.response;
  }
};

/**
 * Get student fee details
 * @param {string} studentId - Student ID
 * @returns {Promise<Object>} Response
 */
const getStudentFeeDetails = async (studentId) => {
  try {
    const response = await api.get(`/finance/student/${studentId}/fees`);
    return response;
  } catch (error) {
    console.error('Get student fee details error:', error);
    return error.response;
  }
};

/**
 * Process payment (parent endpoint)
 * @param {Object} data - Payment data { studentId, feeStructureId, amountPaid }
 * @returns {Promise<Object>} Response
 */
const processPayment = async (data) => {
  try {
    const response = await api.post('/finance/payment', data);
    return response;
  } catch (error) {
    console.error('Process payment error:', error);
    return error.response;
  }
};

const financeService = {
  createFeeStructure,
  getFeeStructures,
  collectFee,
  createPayrollRecord,
  getFeeStatistics,
  getClassFeeStatus,
  getStudentFeeDetails,
  processPayment,
  getReceipts: async () => {
    try {
      const response = await api.get('/finance/receipts');
      return response;
    } catch (error) {
      console.error('Get receipts error:', error);
      return error.response;
    }
  },

  /**
   * Download fee receipt PDF
   * @param {string} paymentId - Payment ID
   * @returns {Promise<Object>} Response (Blob)
   */
  downloadReceipt: async (paymentId) => {
    try {
      const response = await api.get(`/finance/receipt/${paymentId}`, {
        responseType: 'blob', // Important for PDF download
      });
      return response;
    } catch (error) {
      console.error('Download receipt error:', error);
      return error.response;
    }
  },
};

export default financeService;
