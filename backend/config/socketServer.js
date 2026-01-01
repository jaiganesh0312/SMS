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
            next(new Error("Authentication error"));
        }
    });

    io.on("connection", (socket) => {

        // Join user-specific room
        socket.join(`user:${socket.user.id}`);

        // Join school room (optional, for potential school-wide broadcasts)
        socket.join(`school:${socket.user.schoolId}`);

        // Update pending messages to DELIVERED on connect
        (async () => {
            try {
                const pendingMessages = await Message.findAll({
                    where: {
                        receiverId: socket.user.id,
                        status: 'SENT'
                    }
                });

                if (pendingMessages.length > 0) {
                    await Message.update({ status: 'DELIVERED' }, {
                        where: {
                            id: pendingMessages.map(m => m.id)
                        }
                    });

                    // Notify senders
                    const senders = [...new Set(pendingMessages.map(m => m.senderId))];
                    senders.forEach(senderId => {
                        const msgIds = pendingMessages.filter(m => m.senderId === senderId).map(m => m.id);
                        io.to(`user:${senderId}`).emit("chat:status_update", {
                            messageIds: msgIds,
                            status: 'DELIVERED'
                        });
                    });
                }
            } catch (err) {
            }
        })();

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
                if (callback) callback({ success: false, error: error.message });
            }
        });

        // Handle marking as delivered (Real-time)
        socket.on("chat:mark_delivered", async (data) => {
            try {
                const { messageIds } = data; // Expecting array
                if (!messageIds || messageIds.length === 0) return;

                await Message.update({ status: 'DELIVERED' }, {
                    where: {
                        id: messageIds,
                        receiverId: socket.user.id,
                        status: 'SENT' // Only update if currently SENT
                    }
                });

                // Find messages to identify senders to notify
                const messages = await Message.findAll({
                    where: { id: messageIds },
                    attributes: ['id', 'senderId', 'conversationId']
                });

                // Notify senders
                messages.forEach(msg => {
                    io.to(`user:${msg.senderId}`).emit("chat:read_receipt", {
                        messageId: msg.id,
                        conversationId: msg.conversationId,
                        status: 'DELIVERED'
                    });
                    // Also emit generic status update for bulk handling if needed
                });

            } catch (e) {
            }
        });

        // Handle marking conversation as read (Bulk)
        socket.on("chat:mark_conversation_read", async (data) => {
            try {
                const { conversationId } = data;

                // Update all messages in this conversation sent to me
                const [updatedCount] = await Message.update({ status: 'READ' }, {
                    where: {
                        conversationId,
                        receiverId: socket.user.id,
                        status: { [Op.ne]: 'READ' }
                    }
                });

                if (updatedCount > 0) {
                    // Notify sender (Assuming 1-1 chat, find the other user)
                    const conversation = await Conversation.findByPk(conversationId);
                    const otherUserId = conversation.userAId === socket.user.id ? conversation.userBId : conversation.userAId;

                    io.to(`user:${otherUserId}`).emit("chat:conversation_read", {
                        conversationId,
                        receiverId: socket.user.id
                    });
                }

            } catch (e) {
            }
        });

        // Handle marking individual message as read (Legacy/Single)
        socket.on("chat:read", async (data) => {
            try {
                const { messageId } = data;
                const message = await Message.findByPk(messageId);

                if (message && message.receiverId === socket.user.id && message.status !== 'READ') {
                    await message.update({ status: 'READ' });
                    // Notify sender
                    io.to(`user:${message.senderId}`).emit("chat:read_receipt", { messageId, conversationId: message.conversationId, status: 'READ' });
                }
            } catch (e) {
            }
        });

        socket.on("disconnect", () => {
        });

        // =====================
        // BUS TRACKING EVENTS
        // =====================

        // Subscribe to bus location updates
        socket.on("bus:subscribe", async (data) => {
            try {
                const { busId } = data;
                if (!busId) return;

                // TODO: Add validation that user can track this bus
                // For now, allow school members to subscribe

                socket.join(`bus:${busId}`);
            } catch (e) {
            }
        });

        // Unsubscribe from bus updates
        socket.on("bus:unsubscribe", (data) => {
            const { busId } = data;
            if (busId) {
                socket.leave(`bus:${busId}`);
            }
        });

        // Subscribe to school-wide transport updates (admin only)
        socket.on("transport:subscribe", () => {
            if (["SCHOOL_ADMIN", "SUPER_ADMIN", "STAFF"].includes(socket.user.role)) {
                socket.join(`school:${socket.user.schoolId}:transport`);
            }
        });

        // Driver sending location update via socket
        socket.on("bus:location:update", async (data) => {
            try {
                const { busId, lat, lng, speed, heading, accuracy } = data;

                // Validate that user can send updates for this bus
                // For now, allow staff to send updates
                if (!["STAFF", "SCHOOL_ADMIN"].includes(socket.user.role)) {
                    return;
                }

                // Import models dynamically to avoid circular dependency
                const { Bus, BusLocation, BusTrip } = require("../models");

                // Validate bus belongs to user's school
                const bus = await Bus.findOne({
                    where: { id: busId, schoolId: socket.user.schoolId }
                });

                if (!bus) return;

                // Get active trip
                const activeTrip = await BusTrip.findOne({
                    where: { busId, status: "IN_PROGRESS" }
                });

                // Check deduplication
                const lastLocation = await BusLocation.findOne({
                    where: { busId },
                    order: [["timestamp", "DESC"]]
                });

                if (lastLocation) {
                    const diff = Date.now() - new Date(lastLocation.timestamp).getTime();
                    if (diff < 5000) return; // Skip if within 5 seconds
                }

                // Save location
                const location = await BusLocation.create({
                    busId,
                    tripId: activeTrip?.id || null,
                    lat,
                    lng,
                    speed: speed || null,
                    heading: heading || null,
                    accuracy: accuracy || null,
                    timestamp: new Date()
                });

                // Broadcast to subscribers
                const locationData = {
                    busId,
                    lat: parseFloat(lat),
                    lng: parseFloat(lng),
                    speed,
                    heading,
                    timestamp: location.timestamp
                };

                io.to(`bus:${busId}`).emit("bus:location:receive", locationData);
                io.to(`school:${socket.user.schoolId}:transport`).emit("bus:location:receive", locationData);

            } catch (e) {
            }
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
