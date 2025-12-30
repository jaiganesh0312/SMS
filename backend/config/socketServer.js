const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { User, Message, Conversation } = require("../models");
const { Op } = require("sequelize");

let io;

const initSocketServer = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: ["http://localhost:5173", "http://localhost:5174", "https://btp9hpfw-5173.inc1.devtunnels.ms"],
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    // Authentication Middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error("Authentication error: No token provided"));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findByPk(decoded.id);

            if (!user) {
                return next(new Error("Authentication error: User not found"));
            }

            // Check if user is allowed to chat (Block Students)
            if (user.role === 'STUDENT') {
                return next(new Error("Students are not authorized to use chat"));
            }

            socket.user = user;
            next();
        } catch (err) {
            console.error("Socket Auth Error:", err.message);
            next(new Error("Authentication error"));
        }
    });

    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.user.name} (${socket.user.id})`);

        // Join user-specific room
        socket.join(`user:${socket.user.id}`);

        // Join school room (optional, for potential school-wide broadcasts)
        socket.join(`school:${socket.user.schoolId}`);

        // Handle sending message
        socket.on("chat:send", async (data, callback) => {
            try {
                const { conversationId, content, type = "TEXT" } = data;
                const senderId = socket.user.id;

                // Simple validation
                if (!content || !conversationId) return;

                // Fetch conversation to verify and get receiver
                const conversation = await Conversation.findByPk(conversationId);
                if (!conversation) return; // Error?

                // Verify participation
                if (conversation.userAId !== senderId && conversation.userBId !== senderId) {
                    return; // Unauthorized
                }

                const receiverId = conversation.userAId === senderId ? conversation.userBId : conversation.userAId;

                // Store in DB
                const message = await Message.create({
                    conversationId,
                    senderId,
                    receiverId,
                    content,
                    type,
                    status: "SENT" // Default
                });

                // Update conversation
                await conversation.update({ lastMessageAt: new Date() });

                // Emit to receiver
                socket.to(`user:${receiverId}`).emit("chat:receive", message);

                // Acknowledge to sender (optional, if client waits for it)
                if (callback) callback({ success: true, data: message });

            } catch (error) {
                console.error("Socket chat:send error:", error);
                if (callback) callback({ success: false, error: error.message });
            }
        });

        // Handle marking as read
        socket.on("chat:read", async (data) => {
            try {
                const { messageId } = data;
                const message = await Message.findByPk(messageId);

                if (message && message.receiverId === socket.user.id && message.status !== 'READ') {
                    await message.update({ status: 'READ' });
                    // Notify sender
                    io.to(`user:${message.senderId}`).emit("chat:read_receipt", { messageId, conversationId: message.conversationId });
                }
            } catch (e) {
                console.error(e);
            }
        });

        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.user.id}`);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

module.exports = { initSocketServer, getIO };
