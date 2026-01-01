import api from '@/config/axiosConfig';

const getSections = async () => {
    try {
        const response = await api.get('/library/sections');
        return response;
    } catch (error) {
        return error.response;
    }
};

const createSection = async (data) => {
    try {
        const response = await api.post('/library/sections', data);
        return response;
    } catch (error) {
        return error.response;
    }
};

const updateSection = async (id, data) => {
    try {
        const response = await api.put(`/library/sections/${id}`, data);
        return response;
    } catch (error) {
        return error.response;
    }
};

const deleteSection = async (id) => {
    try {
        const response = await api.delete(`/library/sections/${id}`);
        return response;
    } catch (error) {
        return error.response;
    }
};

const getBooks = async (params) => {
    try {
        const response = await api.get('/library/books', { params });
        return response;
    } catch (error) {
        return error.response;
    }
};

const getBookDetails = async (id) => {
    try {
        const response = await api.get(`/library/books/${id}`);
        return response;
    } catch (error) {
        return error.response;
    }
};

const createBook = async (data) => {
    try {
        const response = await api.post('/library/books', data);
        return response;
    } catch (error) {
        return error.response;
    }
};

const updateBook = async (id, data) => {
    try {
        const response = await api.put(`/library/books/${id}`, data);
        return response;
    } catch (error) {
        return error.response;
    }
};

const deleteBook = async (id) => {
    try {
        const response = await api.delete(`/library/books/${id}`);
        return response;
    } catch (error) {
        return error.response;
    }
};

const issueBook = async (data) => {
    try {
        const response = await api.post('/library/issue', data);
        return response;
    } catch (error) {
        return error.response;
    }
};

const returnBook = async (data) => {
    try {
        const response = await api.post('/library/return', data);
        return response;
    } catch (error) {
        return error.response;
    }
};

const renewBook = async (data) => {
    try {
        const response = await api.post('/library/renew', data);
        return response;
    } catch (error) {
        return error.response;
    }
};

const getTransactions = async (params) => {
    try {
        const response = await api.get('/library/transactions', { params });
        return response;
    } catch (error) {
        return error.response;
    }
};

const getDashboardStats = async () => {
    try {
        const response = await api.get('/library/stats');
        return response;
    } catch (error) {
        return error.response;
    }
};

const uploadSectionsBulk = async (formData) => {
    try {
        const response = await api.post('/upload/library-sections', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response;
    } catch (error) {
        return error.response;
    }
};

const uploadBooksBulk = async (formData) => {
    try {
        const response = await api.post('/upload/books', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response;
    } catch (error) {
        return error.response;
    }
};

const libraryService = {
    getSections,
    createSection,
    updateSection,
    deleteSection,
    getBooks,
    getBookDetails,
    createBook,
    updateBook,
    deleteBook,
    issueBook,
    returnBook,
    renewBook,
    getTransactions,
    getDashboardStats,
    uploadSectionsBulk,
    uploadBooksBulk
};

export default libraryService;
