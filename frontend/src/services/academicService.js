import api from '@/config/axiosConfig';

/**
 * Create a new class
 * @param {Object} data - Class data
 * @param {string} data.name - Class name
 * @param {string} data.grade - Grade level
 * @returns {Promise<Object>} Response
 */
const createClass = async (data) => {
  try {
    const response = await api.post('/academics/classes', data);
    return response;
  } catch (error) {
    return error.response;
  }
};

/**
 * Create a new section
 * @param {Object} data - Section data
 * @param {string} data.classId - Class ID
 * @param {string} data.name - Section name
 * @param {string} data.classTeacherId - Class Teacher ID (optional)
 * @returns {Promise<Object>} Response
 */
const createSection = async (data) => {
  try {
    const response = await api.post('/academics/sections', data);
    return response;
  } catch (error) {
    return error.response;
  }
};


/**
 * Get all classes
 * @returns {Promise<Object>} Response
 */
const getAllClasses = async (params) => {
  try {
    const response = await api.get('/academics/classes', { params });
    return response;
  } catch (error) {
    return error.response;
  }
};

/**
 * Create a new subject
 * @param {Object} data - Subject data
 * @param {string} data.name - Subject name
 * @param {string} data.code - Subject code
 * @returns {Promise<Object>} Response
 */
const createSubject = async (data) => {
  try {
    const response = await api.post('/academics/subjects', data);
    return response;
  } catch (error) {
    return error.response;
  }
};

/**
 * Get all subjects
 * @returns {Promise<Object>} Response
 */
const getAllSubjects = async (params) => {
  try {
    const response = await api.get('/academics/subjects', { params });
    return response;
  } catch (error) {
    return error.response;
  }
};

/**
 * Create a new timetable entry
 * @param {Object} data - Timetable entry data
 * @returns {Promise<Object>} Response
 */
const createTimetableEntry = async (data) => {
  try {
    const response = await api.post('/academics/timetable', data);
    return response;
  } catch (error) {
    return error.response;
  }
};

/**
 * Create a daily timetable (bulk)
 * @param {Object} data - Daily timetable data
 * @returns {Promise<Object>} Response
 */
const createDailyTimetable = async (data) => {
  try {
    const response = await api.post('/academics/timetable/daily', data);
    return response;
  } catch (error) {
    return error.response;
  }
};

/**
 * Get timetable
 * @returns {Promise<Object>} Response
 */
const getTimetable = async (params) => {
  try {
    const response = await api.get('/academics/timetable', { params });
    return response;
  } catch (error) {
    return error.response;
  }
};


/**
 * Get distinct standards (class names)
 * @returns {Promise<Object>} Response
 */
const getStandards = async () => {
  try {
    const response = await api.get('/academics/classes/standards');
    return response;
  } catch (error) {
    return error.response;
  }
};

/**
 * Get divisions (sections) for a standard
 * @param {string} standard - Standard name (e.g. "10th")
 * @returns {Promise<Object>} Response
 */
const getDivisions = async (standard) => {
  try {
    const response = await api.get(`/academics/classes/standards/${standard}/divisions`);
    return response;
  } catch (error) {
    return error.response;
  }
};

/**
 * Get all sections
 * @returns {Promise<Object>} Response
 */
const getAllSections = async () => {
  try {
    const response = await api.get('/academics/sections');
    return response;
  } catch (error) {
    return error.response;
  }
};

/**
 * Get all teachers (for dropdowns)
 * @returns {Promise<Object>} Response
 */
const getTeachers = async () => {
  try {
    const response = await api.get('/academics/teachers');
    return response;
  } catch (error) {
    return error.response;
  }
};

/**
  * Assign class teacher (to a section)
  * @param {string} sectionId 
  * @param {string} teacherId 
  * @returns {Promise<Object>} Response
  */
const assignClassTeacher = async (sectionId, teacherId) => {
  try {
    const response = await api.patch(`/academics/sections/${sectionId}/teacher`, { teacherId });
    return response;
  } catch (error) {
    return error.response;
  }
};

const academicService = {
  createClass,
  createSection,
  getAllClasses,
  createSubject,
  getAllSubjects,
  createTimetableEntry,
  createDailyTimetable,
  getTimetable,
  getStandards,
  getDivisions,
  getTeachers,
  getAllSections,
  assignClassTeacher
};

export default academicService;
