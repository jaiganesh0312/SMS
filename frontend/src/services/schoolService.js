import api from "../config/axiosConfig";

const schoolService = {
    getSchoolDetails: async () => {
        try {
            const response = await api.get("/school");
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    uploadLogo: async (formData) => {
        try {
            const response = await api.post("/school/upload-logo", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};

export default schoolService;
