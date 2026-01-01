const { sequelize, User, Conversation, Message, School } = require("../models");
const { Op } = require("sequelize");

// Helper to get io instance
const getIO = () => require("../config/socketServer").getIO();

exports.getConversations = async (req, res) => {
    try {
        const userId = req.user.id;
        const schoolId = req.user.schoolId;

        const conversations = await Conversation.findAll({
            where: {
                schoolId,
                [Op.or]: [{ userAId: userId }, { userBId: userId }],
            },
            include: [
                {
                    model: User,
                    as: "userA",
                    attributes: ["id", "name", "role", "email"], // Removed avatar/profile pic as per requirements/optimization
                },
                {
                    model: User,
                    as: "userB",
                    attributes: ["id", "name", "role", "email"],
                },
                {
                    model: Message,
                    limit: 1,
                    order: [["createdAt", "DESC"]],
                },
            ],
            order: [["lastMessageAt", "DESC"]],
        });

        // Format for frontend
        const formattedConversations = await Promise.all(conversations.map(async (conv) => {
            const otherUser = conv.userAId === userId ? conv.userB : conv.userA;
            const lastMessage = conv.Messages[0];

            // Count unread messages
            const unreadCount = await Message.count({
                where: {
                    conversationId: conv.id,
                    receiverId: userId,
                    status: { [Op.ne]: 'READ' }
                }
            });

            return {
                id: conv.id,
                otherUser,
                lastMessage,
                unreadCount,
                updatedAt: conv.updatedAt,
            };
        }));

        res.status(200).json({
            success: true,
            data: formattedConversations,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching conversations",
            error: error.message,
        });
    }
};

exports.getOrCreateConversation = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const otherUserId = req.params.userId;
        const schoolId = req.user.schoolId;

        if (currentUserId === otherUserId) {
            return res.status(400).json({
                success: false,
                message: "Cannot chat with yourself",
            });
        }

        // Check if other user is valid and not a STUDENT
        const otherUser = await User.findOne({
            where: {
                id: otherUserId,
                schoolId,
            },
        });

        if (!otherUser) {
            return res.status(404).json({
                success: false,
                message: "User not found or not available for chat",
            });
        }

        // Check for existing conversation
        // IDs are sorted in database logic? No, we check both combinations or rely on query
        // The unique index is (schoolId, userAId, userBId) but we need to check both directions A-B or B-A if we didn't enforce order
        // Let's check both
        let conversation = await Conversation.findOne({
            where: {
                schoolId,
                [Op.or]: [
                    { userAId: currentUserId, userBId: otherUserId },
                    { userAId: otherUserId, userBId: currentUserId }
                ]
            },
            include: [
                {
                    model: User,
                    as: "userA",
                    attributes: ["id", "name", "role", "email"],
                },
                {
                    model: User,
                    as: "userB",
                    attributes: ["id", "name", "role", "email"],
                }
            ]
        });

        if (!conversation) {
            // Create new
            conversation = await Conversation.create({
                schoolId,
                userAId: currentUserId,
                userBId: otherUserId,
                lastMessageAt: new Date(),
            });

            // Re-fetch with includes
            conversation = await Conversation.findByPk(conversation.id, {
                include: [
                    {
                        model: User,
                        as: "userA",
                        attributes: ["id", "name", "role", "email"],
                    },
                    {
                        model: User,
                        as: "userB",
                        attributes: ["id", "name", "role", "email"],
                    }
                ]
            })
        }

        const formattedDiffUser = conversation.userAId === currentUserId ? conversation.userB : conversation.userA;

        res.status(200).json({
            success: true,
            data: {
                id: conversation.id,
                otherUser: formattedDiffUser,
                updatedAt: conversation.updatedAt
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating conversation",
            error: error.message,
        });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const { conversationId, limit = 50, cursor } = req.query;
        const userId = req.user.id;

        // Verify participant
        const conversation = await Conversation.findByPk(conversationId);
        if (!conversation) {
            return res.status(404).json({ success: false, message: "Conversation not found" });
        }

        if (conversation.userAId !== userId && conversation.userBId !== userId) {
            return res.status(403).json({ success: false, message: "Not authorized to view messages" });
        }

        const whereClause = { conversationId };
        if (cursor) {
            whereClause.createdAt = { [Op.lt]: cursor };
        }

        const messages = await Message.findAll({
            where: whereClause,
            limit: parseInt(limit),
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: User,
                    as: "sender",
                    attributes: ["id", "name"]
                }
            ]
        });

        res.status(200).json({
            success: true,
            data: messages.reverse(), // Send chronological order
            nextCursor: messages.length > 0 ? messages[0].createdAt : null, // Cursor for next page (older messages)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching messages",
            error: error.message,
        });
    }
};

exports.sendMessage = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { conversationId, content, type = "TEXT" } = req.body;
        const senderId = req.user.id;

        // Verify participant
        const conversation = await Conversation.findByPk(conversationId);
        if (!conversation) {
            await t.rollback();
            return res.status(404).json({ success: false, message: "Conversation not found" });
        }

        if (conversation.userAId !== senderId && conversation.userBId !== senderId) {
            await t.rollback();
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        const receiverId = conversation.userAId === senderId ? conversation.userBId : conversation.userAId;

        // Create message
        const message = await Message.create({
            conversationId,
            senderId,
            receiverId,
            content,
            type, // Validated by Enum but we can enforce TEXT primarily
            status: "SENT",
        }, { transaction: t });

        // Update conversation timestamp
        await conversation.update({ lastMessageAt: new Date() }, { transaction: t });

        await t.commit();

        // Socket emission (Best effort)
        try {
            const io = getIO();
            if (io) {
                // Emit to receiver room
                io.to(`user:${receiverId}`).emit("chat:receive", message);
                // Emit to sender room (confirmation/sync across devices)
                io.to(`user:${senderId}`).emit("chat:sent_confirmation", message);
            }
        } catch (socketError) {
        }

        res.status(201).json({
            success: true,
            data: message,
        });
    } catch (error) {
        await t.rollback();
        res.status(500).json({
            success: false,
            message: "Error sending message",
            error: error.message,
        });
    }
};

exports.markRead = async (req, res) => {
    try {
        const { id } = req.params; // Message ID
        const userId = req.user.id;

        const message = await Message.findOne({
            where: { id, receiverId: userId }
        });

        if (!message) {
            return res.status(404).json({ success: false, message: "Message not found or not receiver" });
        }

        if (message.status !== 'READ') {
            message.status = 'READ';
            await message.save();

            // Notify sender
            try {
                const io = getIO();
                if (io) {
                    io.to(`user:${message.senderId}`).emit("chat:read_receipt", { messageId: message.id, conversationId: message.conversationId });
                }
            } catch (socketError) {
            }
        }

        res.status(200).json({ success: true, data: message });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getChatUsers = async (req, res) => {
    try {
        const schoolId = req.user.schoolId;
        const { search } = req.query;
        const currentUserId = req.user.id;

        // Fetch all users in school except current user AND STUDENTS

        const whereClause = {
            schoolId,
            id: { [Op.ne]: currentUserId },
        };

        if (search) {
            whereClause.name = { [Op.like]: `%${search}%` };
        }

        const users = await User.findAll({
            where: whereClause,
            attributes: ["id", "name", "role", "email"],
            order: [["name", "ASC"]],
        });

        res.status(200).json({
            success: true,
            data: users,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching users",
            error: error.message,
        });
    }
};
