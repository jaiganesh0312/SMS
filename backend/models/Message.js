const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Message = sequelize.define(
    "Message",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        conversationId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "conversations",
                key: "id",
            },
        },
        senderId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "users",
                key: "id",
            },
        },
        receiverId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "users",
                key: "id",
            },
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM("TEXT", "IMAGE", "FILE"),
            defaultValue: "TEXT",
        },
        status: {
            type: DataTypes.ENUM("SENT", "DELIVERED", "READ"),
            defaultValue: "SENT",
        },
    },
    {
        tableName: "messages",
        timestamps: true,
        updatedAt: false, // Messages are immutable, only status updates might change checks but usually we track readAt separately if needed, but standard updatedAt is fine for status changes.
        paranoid: true,
        indexes: [
            {
                fields: ["conversationId"],
            },
            {
                fields: ["senderId"],
            },
            {
                fields: ["receiverId"],
            },
        ],
    }
);

module.exports = Message;
