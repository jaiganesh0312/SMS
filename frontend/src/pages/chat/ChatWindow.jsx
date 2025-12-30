import React, { useEffect, useRef, useState } from 'react';
import { Button, Input, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import chatService from '@/services/chatService';
import MessageBubble from './MessageBubble';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/context/AuthContext';

const ChatWindow = ({ conversation, currentUser, onBack }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const messagesContainerRef = useRef(null);
    const { socket, isConnected } = useSocket();
    const { user } = useAuth(); // Ensures we have current user context

    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            const { scrollHeight, clientHeight } = messagesContainerRef.current;
            messagesContainerRef.current.scrollTo({
                top: scrollHeight - clientHeight,
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        const fetchMessages = async () => {
            if (!conversation?.id) return;
            setLoading(true);
            try {
                const res = await chatService.getMessages(conversation.id);
                if (res.success) {
                    setMessages(res.data);
                }
            } catch (error) {
                console.error("Failed to load messages", error);
            } finally {
                setLoading(false);
                // use setTimeout to ensure render cycle complete
                setTimeout(() => {
                    if (messagesContainerRef.current) {
                        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
                    }
                }, 0);
            }
        };

        fetchMessages();
    }, [conversation?.id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Socket listeners
    useEffect(() => {
        if (!socket || !conversation) return;

        const handleReceiveMessage = (message) => {
            if (message.conversationId === conversation.id) {
                setMessages((prev) => [...prev, message]);
                // Mark as read immediately if window is open (Basic implementation)
                if (message.senderId !== user.id) {
                    socket.emit('chat:read', { messageId: message.id });
                }
            }
        };

        const handleReadReceipt = ({ messageId, conversationId }) => {
            if (conversationId === conversation.id) {
                setMessages(prev => prev.map(msg =>
                    msg.id === messageId ? { ...msg, status: 'READ' } : msg
                ));
            }
        };

        // Also listen for my own messages sent from other devices if needed, 
        // but for now relying on local update or confirm.
        // Ideally we listen to everything to stay in sync.

        socket.on('chat:receive', handleReceiveMessage);
        socket.on('chat:read_receipt', handleReadReceipt);

        return () => {
            socket.off('chat:receive', handleReceiveMessage);
            socket.off('chat:read_receipt', handleReadReceipt);
        };
    }, [socket, conversation, user.id]);


    const handleSend = async () => {
        if (!newMessage.trim() || sending) return;

        const tempContent = newMessage;
        setNewMessage(""); // Clear immediately for UX
        setSending(true);

        const sendMessageViaApi = async () => {
            try {
                const res = await chatService.sendMessage(conversation.id, tempContent, "TEXT");
                if (res.success) {
                    setMessages((prev) => [...prev, res.data]);
                }
            } catch (error) {
                console.error("Failed to send via API", error);
                setNewMessage(tempContent); // Restore on final failure
            } finally {
                setSending(false);
            }
        };

        if (isConnected && socket) {
            // Socket-first approach
            const timeout = setTimeout(() => {
                // Determine if we should fallback if no ack received in time?
                // For now, let's assume if callback isn't called, it might be stuck.
                // But generally safe to rely on callback or disconnect.
                // Implementing a simple fallback if no response in 3s
                console.warn("Socket timeout, falling back to API");
                sendMessageViaApi();
            }, 3000);

            socket.emit('chat:send', {
                conversationId: conversation.id,
                content: tempContent,
                type: "TEXT"
            }, (response) => {
                clearTimeout(timeout);
                if (response.success) {
                    setMessages((prev) => [...prev, response.data]);
                    setSending(false);
                } else {
                    console.error("Socket error response:", response.error);
                    sendMessageViaApi(); // Fallback on server error
                }
            });
        } else {
            // Offline/No Socket
            sendMessageViaApi();
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!conversation) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-400">
                Select a conversation to start chatting
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* Header */}
            <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between shadow-sm sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    {onBack && (
                        <button onClick={onBack} className="md:hidden p-1 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full">
                            <Icon icon="mdi:chevron-left" className="text-2xl" />
                        </button>
                    )}
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-800">{conversation.otherUser?.name || "User"}</h3>
                            <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full uppercase font-bold tracking-wide">
                                {conversation.otherUser?.role}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500">{conversation.otherUser?.email}</p>
                    </div>
                </div>
                {!isConnected && (
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">Offline</span>
                        <Button
                            size="sm"
                            variant="flat"
                            color="warning"
                            onPress={() => conversation?.id && chatService.getMessages(conversation.id).then(res => res.success && setMessages(res.data))}
                            className="h-6 text-xs"
                        >
                            Refresh
                        </Button>
                    </div>
                )}
            </div>

            {/* Messages Area */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                    <div className="flex justify-center py-10"><Spinner /></div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-gray-400 py-10">No messages yet. Say hello! 👋</div>
                ) : (
                    messages.map((msg) => (
                        <MessageBubble
                            key={msg.id}
                            message={msg}
                            isOwn={msg.senderId === user.id}
                        />
                    ))
                )}
            </div>

            {/* Input Area */}
            <div className="bg-white p-4 border-t border-gray-200">
                <div className="flex gap-2 items-end max-w-4xl mx-auto">
                    <div className="flex-1">
                        <Input
                            placeholder="Type a message..."
                            value={newMessage}
                            onValueChange={setNewMessage} // HeroUI Input uses onValueChange
                            onKeyDown={handleKeyPress}
                            size="lg"
                            radius="full"
                            classNames={{
                                input: "text-base",
                                inputWrapper: "bg-gray-100 hover:bg-gray-200 shadow-none border-none data-[hover=true]:bg-gray-200 group-data-[focus=true]:bg-white group-data-[focus=true]:ring-2 group-data-[focus=true]:ring-primary/20 transition-all",
                            }}
                            endContent={
                                <div className="flex gap-2">
                                    {/* Emoji support is implicit via OS picker for now */}
                                </div>
                            }
                        />
                    </div>
                    <Button
                        isIconOnly
                        color="primary"
                        radius="full"
                        size="lg"
                        onPress={handleSend}
                        isLoading={sending}
                        className="mb-0.5 shadow-md bg-gradient-to-tr from-blue-600 to-blue-500"
                    >
                        {!sending && (
                            <Icon icon="mdi:send" className="text-xl" />
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;
