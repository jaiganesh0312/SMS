const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Notification = sequelize.define(
  "Notification",
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
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: "users",
            key: "id",
        }
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM("SENT", "READ", "FAILED"),
        defaultValue: "SENT"
    },
    type: {
        type: DataTypes.ENUM("EMAIL", "SMS", "IN_APP"),
        defaultValue: "IN_APP"
    }
  },
  {
    tableName: "notifications",
    timestamps: true,
    paranoid: true,
  }
);

module.exports = Notification;
