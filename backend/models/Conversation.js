const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Conversation = sequelize.define(
  "Conversation",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    schoolId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "schools",
        key: "id",
      },
    },
    userAId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    userBId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    lastMessageAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "conversations",
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ["schoolId", "userAId", "userBId"],
        where: {
          deletedAt: null
        }
      },
    ],
  }
);

module.exports = Conversation;
