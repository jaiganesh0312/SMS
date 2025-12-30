import api from "@/config/axiosConfig"

const announcementService = {
  // Get all announcements (role-based filtering on backend)
  getAnnouncements: async () => {
    const response = await api.get('/announcements');
    return response.data;
  },

  // Create announcement
  createAnnouncement: async (data) => {
    const response = await api.post('/announcements', data);
    return response.data;
  },

  // Update announcement
  updateAnnouncement: async (id, data) => {
    const response = await api.put(`/announcements/${id}`, data);
    return response.data;
  },

  // Delete announcement
  deleteAnnouncement: async (id) => {
    const response = await api.delete(`/announcements/${id}`);
    return response.data;
  },
};


export default announcementService;