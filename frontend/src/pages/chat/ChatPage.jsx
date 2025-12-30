import React, { useEffect, useState } from 'react';
import { Card, CardBody, Button, Spinner, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, User as UserAvatar } from "@heroui/react";
import { Icon } from "@iconify/react";
import chatService from '@/services/chatService';
import ChatWindow from './ChatWindow';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';

const ChatPage = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]); // For new chat modal
    const [loadingUsers, setLoadingUsers] = useState(false);

    // View state for mobile responsiveness
    const [view, setView] = useState('list'); // 'list' or 'chat'

    const { isOpen, onOpen, onClose } = useDisclosure();
    const { user: currentUser } = useAuth();
    const { socket, isConnected } = useSocket();

    useEffect(() => {
        fetchConversations();
    }, [isConnected]); // Refetch when connection restores

    useEffect(() => {
        if (!socket) return;

        const handleReceiveMessage = (message) => {
            setConversations(prev => {
                const existingIndex = prev.findIndex(c => c.id === message.conversationId);

                if (existingIndex !== -1) {
                    // Update existing
                    const updatedConversations = [...prev];
                    const conversation = updatedConversations[existingIndex];
                    updatedConversations.splice(existingIndex, 1);
                    updatedConversations.unshift({
                        ...conversation,
                        lastMessage: message,
                        unreadCount: (conversation.unreadCount || 0) + 1,
                        updatedAt: message.createdAt
                    });
                    return updatedConversations;
                } else {
                    // New conversation, fetch all to be safe and accurate or just add if we had the object
                    fetchConversations();
                    return prev;
                }
            });
        };

        socket.on('chat:receive', handleReceiveMessage);

        // Listen for new conversations explicitly if we add that event, but chat:receive on new convo covers it essentially 

        return () => {
            socket.off('chat:receive', handleReceiveMessage);
        };
    }, [socket]);

    const fetchConversations = async () => {
        try {
            setLoading(true);
            const res = await chatService.getConversations();
            if (res.success) {
                setConversations(res.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectConversation = (conv) => {
        // Reset unread count locally
        setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unreadCount: 0 } : c));
        setSelectedConversation(conv);
        setView('chat');
    };

    const handleNewChatClick = async () => {
        onOpen();
        setLoadingUsers(true);
        try {
            const res = await chatService.getChatUsers();
            if (res.success) {
                setUsers(res.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingUsers(false);
        }
    };

    const startChat = async (userId) => {
        try {
            // Optimistically check if we already have this conversation
            const existing = conversations.find(c => c.otherUser.id === userId);
            if (existing) {
                handleSelectConversation(existing);
                onClose();
                return;
            }

            const res = await chatService.getOrCreateConversation(userId);
            if (res.success) {
                setConversations(prev => [res.data, ...prev]);
                handleSelectConversation(res.data);
                onClose();
            }
        } catch (error) {
            console.error("Failed to start chat", error);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const days = diff / (1000 * 60 * 60 * 24);

        if (days < 1) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (days < 7) return date.toLocaleDateString([], { weekday: 'short' });
        return date.toLocaleDateString();
    };

    return (
        <div className="h-[calc(100vh-6rem)] w-full flex bg-gray-100 rounded-xl overflow-hidden shadow-sm border border-gray-200">
            {/* Sidebar - Conversations List */}
            <div className={`${view === 'chat' ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 flex-col bg-white border-r border-gray-200 z-0`}>
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white sticky top-0">
                    <h2 className="text-xl font-bold text-gray-800">Messages</h2>
                    <div className="flex items-center gap-2">
                        {!isConnected && (
                            <Button
                                size="sm"
                                variant="light"
                                color="warning"
                                isIconOnly
                                onPress={() => fetchConversations()}
                                className="text-yellow-600"
                                title="Refresh conversations"
                            >
                                <Icon icon="mdi:refresh" className="text-xl" />
                            </Button>
                        )}
                        <Button size="sm" color="primary" isIconOnly onPress={handleNewChatClick} className="rounded-full shadow-sm bg-blue-600">
                            <Icon icon="mdi:message-plus" className="text-xl" />
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center p-8"><Spinner size="sm" /></div>
                    ) : conversations.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-sm">
                            No conversations yet.<br />Start a new chat!
                        </div>
                    ) : (
                        conversations.map(conv => (
                            <div
                                key={conv.id}
                                onClick={() => handleSelectConversation(conv)}
                                className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 
                                ${selectedConversation?.id === conv.id ? 'bg-blue-50/50 border-l-4 border-l-blue-600' : 'border-l-4 border-l-transparent'}
                            `}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-center gap-1.5 overflow-hidden">
                                        <h4 className="font-semibold text-gray-800 text-sm truncate">{conv.otherUser.name}</h4>
                                        <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200 uppercase font-medium tracking-wide whitespace-nowrap">
                                            {conv.otherUser.role}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-[10px] text-gray-400">{formatDate(conv.lastMessage?.createdAt || conv.updatedAt)}</span>
                                        {conv.unreadCount > 0 && (
                                            <div className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                                                {conv.unreadCount}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 truncate h-5">
                                    {conv.lastMessage ? (
                                        <>
                                            {conv.lastMessage.senderId === currentUser.id && 'You: '}
                                            {conv.lastMessage.content}
                                        </>
                                    ) : (
                                        <span className="italic text-gray-400">New conversation</span>
                                    )}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Listen for conversation updates? Ideally via socket too to update the list order/last msg */}

            {/* Main Window - Chat Area */}
            <div className={`${view === 'list' ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-gray-50 z-0`}>
                {selectedConversation ? (
                    <ChatWindow
                        conversation={selectedConversation}
                        currentUser={currentUser}
                        onBack={() => { setView('list'); setSelectedConversation(null); }}
                    />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                        </div>
                        <p>Select a conversation to start chatting</p>
                    </div>
                )}
            </div>

            {/* New Chat Modal */}
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                size="md"
                scrollBehavior="inside"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">New Chat</ModalHeader>
                            <ModalBody>
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2">Available Users</p>
                                {loadingUsers ? (
                                    <div className="flex justify-center py-4"><Spinner /></div>
                                ) : (
                                    <div className="space-y-1">
                                        {users.map(u => (
                                            <button
                                                key={u.id}
                                                onClick={() => startChat(u.id)}
                                                className="w-full bg-gray-50 p-3 rounded-lg flex items-center gap-3 hover:bg-gray-100 transition-colors text-left group"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs uppercase group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                    {u.name.substring(0, 2)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-800">{u.name}</p>
                                                    <p className="text-[10px] text-gray-500 uppercase">{u.role}</p>
                                                </div>
                                            </button>
                                        ))}
                                        {users.length === 0 && <p className="text-center text-sm text-gray-500 py-4">No users available</p>}
                                    </div>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Cancel
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
};

export default ChatPage;
