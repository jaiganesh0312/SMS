import api from '@/config/axiosConfig';

/**
 * Register a new user
 * @param {Object} data - Registration data
 * @param {string} data.email - User email (required)
 * @param {string} data.firstName - User first name (required)
 * @param {string} data.lastName - User last name (required)
 * @param {string} data.phoneNumber - User phone number (optional)
 * @returns {Promise<Object>} Response with success status and message
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Object} response.data.data - User data (without sensitive info)
 */
const register = async (data) => {
  try {
    const response = await api.post('/auth/register', data);
    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return error.response;
  }
};

/**
 * Verify OTP for user registration
 * @param {Object} data - OTP verification data
 * @param {string} data.email - User email (required)
 * @param {string} data.otp - OTP code (required)
 * @returns {Promise<Object>} Response with token and user data
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Object} response.data.data - User and token data
 * @returns {string} response.data.data.token - JWT token
 * @returns {Object} response.data.data.user - User object
 */
const verifyOtp = async (data) => {
  try {
    const response = await api.post('/auth/verify-otp', data);
    return response;
  } catch (error) {
    console.error('OTP verification error:', error);
    return error.response;
  }
};

/**
 * Login user
 * @param {Object} data - Login credentials
 * @param {string} data.email - User email (required)
 * @param {string} data.password - User password (required)
 * @returns {Promise<Object>} Response with token and user data
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Object} response.data.data - Login data
 * @returns {string} response.data.data.token - JWT token
 * @returns {Object} response.data.data.user - User object
 * @returns {Array} response.data.data.roles - User roles
 */
const login = async (data) => {
  try {
    const response = await api.post('/auth/login', data);
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return error.response;
  }
};

/**
 * Register a new school
 * @param {Object} data - School registration data
 * @param {string} data.schoolName - School name (required)
 * @param {string} data.email - Admin email (required)
 * @param {string} data.password - Admin password (required)
 * @param {string} data.address - School address (required)
 * @param {string} data.firstName - Admin first name (required)
 * @param {string} data.lastName - Admin last name (required)
 * @param {string} data.phone - Admin phone (required)
 * @returns {Promise<Object>} Response with success status and message
 */
const registerSchool = async (data) => {
  try {
    const response = await api.post('/auth/register-school', data);
    return response;
  } catch (error) {
    console.error('School registration error:', error);
    return error.response;
  }
};

/**
 * Register a new staff member
 * @param {Object} data - Staff registration data
 * @param {string} data.email - Staff email (required)
 * @param {string} data.firstName - Staff first name (required)
 * @param {string} data.lastName - Staff last name (required)
 * @param {string} data.password - Staff password (required)
 * @param {string} data.schoolId - School ID (required)
 * @returns {Promise<Object>} Response with success status and message
 */
const registerStaff = async (data) => {
  try {
    const response = await api.post('/auth/register-staff', data);
    return response;
  } catch (error) {
    console.error('Staff registration error:', error);
    return error.response;
  }
};

/**
 * Update user password
 * @param {Object} data - Password update data
 * @param {string} data.currentPassword - Current password (required)
 * @param {string} data.newPassword - New password (required)
 * @returns {Promise<Object>} Response with success status and message
 */
const updatePassword = async (data) => {
  try {
    const response = await api.put('/auth/update-password', data);
    return response;
  } catch (error) {
    console.error('Password update error:', error);
    return error.response;
  }
};


const authService = {
  register,
  verifyOtp,
  login,
  registerSchool,
  registerStaff,
  updatePassword
};

export default authService;
