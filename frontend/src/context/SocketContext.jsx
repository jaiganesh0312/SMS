import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const { isAuthenticated } = useAuth(); // Monitor auth state
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Only connect if authenticated
        let newSocket;
        const token = localStorage.getItem('token');

        if (isAuthenticated && token) {
            const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';

            newSocket = io(SOCKET_URL, {
                auth: { token },
                withCredentials: true,
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
            });

            newSocket.on('connect', () => {
                setIsConnected(true);
            });

            newSocket.on('disconnect', () => {
                setIsConnected(false);
            });

            newSocket.on('connect_error', (err) => {
                setIsConnected(false);
            });

            // Global listener to acknowledge delivery
            newSocket.on('chat:receive', (message) => {
                // If we receive a message, we are online. Confirm delivery.
                newSocket.emit('chat:mark_delivered', { messageIds: [message.id] });
            });

            setSocket(newSocket);
        }

        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
    }, [isAuthenticated]); // Re-run if auth state changes

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    return useContext(SocketContext);
};
