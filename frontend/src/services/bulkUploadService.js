import api from '@/config/axiosConfig';

const uploadFile = async (url, file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await api.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response;
    } catch (error) {
        console.error(`Upload error for ${url}:`, error);
        return error.response;
    }
};

const uploadStudents = (file) => uploadFile('/upload/students', file);
const uploadAttendance = (file) => uploadFile('/upload/attendance', file);
const uploadExams = (file) => uploadFile('/upload/exams', file);
const uploadResults = (file) => uploadFile('/upload/results', file);
const uploadLibrarySections = (file) => uploadFile('/upload/library-sections', file);
const uploadBooks = (file) => uploadFile('/upload/books', file);

const bulkUploadService = {
    uploadStudents,
    uploadAttendance,
    uploadExams,
    uploadResults,
    uploadLibrarySections,
    uploadBooks
};

export default bulkUploadService;
