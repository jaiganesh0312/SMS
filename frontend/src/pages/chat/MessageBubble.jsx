import React from 'react';
import { Icon } from '@iconify/react';

const MessageBubble = ({ message, isOwn }) => {
    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
            <div
                className={`max-w-[70%] px-4 py-2 rounded-lg shadow-sm ${isOwn
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                    }`}
            >
                <p className="text-sm sm:text-base whitespace-pre-wrap break-words">{message.content}</p>
                <div className={`text-[10px] mt-1 flex items-center ${isOwn ? 'text-blue-100 justify-end' : 'text-gray-400'}`}>
                    <span>{formatTime(message.createdAt)}</span>
                    {isOwn && (
                        <span className="ml-1 flex items-center">
                            {message.status === 'SENT' && (
                                <Icon
                                    icon="material-symbols:check"
                                    className="text-xs text-gray-400"
                                />
                            )}

                            {message.status === 'DELIVERED' && (
                                <Icon
                                    icon="material-symbols:done-all"
                                    className="text-sm text-gray-400"
                                />
                            )}

                            {message.status === 'READ' && (
                                <Icon
                                    icon="material-symbols:done-all"
                                    className="text-sm text-green-400"
                                />
                            )}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;
