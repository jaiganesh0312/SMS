import api from '@/config/axiosConfig';

// Get all galleries (with thumbnail)
const getAllGalleries = async () => {
    try {
        const response = await api.get('/gallery');
        return response;
    } catch (error) {
        return error.response;
    }
};

// Get single gallery with all images
const getGalleryById = async (id) => {
    try {
        const response = await api.get(`/gallery/${id}`);
        return response;
    } catch (error) {
        return error.response;
    }
};

// Create Gallery Metadata
const createGallery = async (data) => {
    try {
        const response = await api.post('/gallery', data);
        return response;
    } catch (error) {
        return error.response;
    }
};

// Upload images to a gallery
const addImages = async (id, formData) => {
    try {
        const response = await api.post(`/gallery/${id}/images`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response;
    } catch (error) {
        return error.response;
    }
};

// Delete gallery
const deleteGallery = async (id) => {
    try {
        const response = await api.delete(`/gallery/${id}`);
        return response;
    } catch (error) {
        return error.response;
    }
};

const galleryService = {
    getAllGalleries,
    getGalleryById,
    createGallery,
    addImages,
    deleteGallery
};

export default galleryService;
