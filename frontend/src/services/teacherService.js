import api from '@/config/axiosConfig';

const getMyClass = async () => {
    try {
        const response = await api.get('/teacher/my-class');
        return response;
    } catch (error) {
        return error.response;
    }
};

const getMyStudents = async () => {
    try {
        const response = await api.get('/teacher/my-students');
        return response;
    } catch (error) {
        return error.response;
    }
};

const getIDCardData = async (studentId) => {
    try {
        const response = await api.get(`/teacher/student/${studentId}/id-card`);
        return response;
    } catch (error) {
        return error.response;
    }
};

const getMyPeriods = async () => {
    try {
        const response = await api.get('/teacher/my-periods');
        return response;
    } catch (error) {
        return error.response;
    }
};

const getMyClassTimetable = async () => {
    try {
        const response = await api.get('/teacher/my-class-timetable');
        return response;
    } catch (error) {
        return error.response;
    }
};

const teacherService = {
    getMyClass,
    getMyStudents,
    getIDCardData,
    getMyPeriods,
    getMyClassTimetable
};

export default teacherService;
