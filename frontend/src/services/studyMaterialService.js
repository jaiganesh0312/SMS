import api from "@/config/axiosConfig"

const studyMaterialService = {
    // =====================
    // SECTION API
    // =====================

    // Create a new section
    createSection: async (sectionData) => {
        try {
            const response = await api.post(`/study-materials/sections`, sectionData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get all sections with filters
    getAllSections: async (filters = {}) => {
        try {
            const response = await api.get(`/study-materials/sections`, {
                params: filters,
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get section by ID
    getSectionById: async (id) => {
        try {
            const response = await api.get(`/study-materials/sections/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update section
    updateSection: async (id, sectionData) => {
        try {
            const response = await api.put(`/study-materials/sections/${id}`, sectionData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete section
    deleteSection: async (id) => {
        try {
            const response = await api.delete(`/study-materials/sections/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Toggle section publish status
    toggleSectionPublish: async (id) => {
        try {
            const response = await api.patch(`/study-materials/sections/${id}/publish`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // =====================
    // MATERIAL API
    // =====================

    // Upload material
    uploadMaterial: async (sectionId, formData, onProgress) => {
        try {
            const response = await api.post(
                `/study-materials/sections/${sectionId}/materials`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    onUploadProgress: (progressEvent) => {
                        if (onProgress) {
                            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                            onProgress(percentCompleted);
                        }
                    },
                }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get material by ID
    getMaterialById: async (id) => {
        try {
            const response = await api.get(`/study-materials/materials/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update material
    updateMaterial: async (id, materialData) => {
        try {
            const response = await api.put(`/study-materials/materials/${id}`, materialData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete material
    deleteMaterial: async (id) => {
        try {
            const response = await api.delete(`/study-materials/materials/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Toggle material publish status
    toggleMaterialPublish: async (id) => {
        try {
            const response = await api.patch(`/study-materials/materials/${id}/publish`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get stream token and URL for video
    getStreamUrl: async (id) => {
        try {
            const response = await api.get(`/study-materials/materials/${id}/stream`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Download document
    downloadDocument: async (id, fileName) => {
        try {
            const response = await api.get(`/study-materials/materials/${id}/download`, {
                responseType: 'blob',
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName || 'document');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            return true;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default studyMaterialService;
