import api from '@/config/axiosConfig';

/**
 * Get my notifications
 * @returns {Promise<Object>} Response
 */
const getMyNotifications = async () => {
  try {
    const response = await api.get('/notifications');
    return response;
  } catch (error) {
    console.error('Get notifications error:', error);
    return error.response;
  }
};

/**
 * Mark notification as read
 * @param {string} id - Notification ID
 * @returns {Promise<Object>} Response
 */
const markAsRead = async (id) => {
  try {
    const response = await api.patch(`/notifications/${id}/read`);
    return response;
  } catch (error) {
    console.error('Mark as read error:', error);
    return error.response;
  }
};

const notificationService = {
  getMyNotifications,
  markAsRead,
};

export default notificationService;
