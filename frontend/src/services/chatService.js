import api from '@/config/axiosConfig';

const getConversations = async () => {
    try {
        const response = await api.get('/chat/conversations');
        return response.data;
    } catch (error) {
        throw error;
    }
};

const getOrCreateConversation = async (userId) => {
    try {
        const response = await api.post(`/chat/conversations/${userId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

const getMessages = async (conversationId, cursor = null, limit = 50) => {
    try {
        const response = await api.get('/chat/messages', {
            params: { conversationId, cursor, limit }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

const sendMessage = async (conversationId, content, type = "TEXT") => {
    try {
        const response = await api.post('/chat/messages', {
            conversationId, content, type
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

const markRead = async (messageId) => {
    try {
        const response = await api.patch(`/chat/messages/${messageId}/read`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

const getChatUsers = async (search = '') => {
    try {
        const response = await api.get('/chat/users', {
            params: { search }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

const chatService = {
    getConversations,
    getOrCreateConversation,
    getMessages,
    sendMessage,
    markRead,
    getChatUsers
};

export default chatService;
