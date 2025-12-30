const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Announcement = sequelize.define(
  "Announcement",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    authorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    authorRole: {
      type: DataTypes.ENUM("SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"),
      allowNull: false,
    },
    schoolId: {
      type: DataTypes.UUID,
      allowNull: false, // Required - SUPER_ADMIN creates multiple records for multiple schools
      references: {
        model: "schools",
        key: "id",
      },
    },
    classId: {
      type: DataTypes.UUID,
      allowNull: true, // Optional - if specific to a class
      references: {
        model: "classes",
        key: "id",
      },
    },
    priority: {
      type: DataTypes.ENUM("LOW", "MEDIUM", "HIGH"),
      defaultValue: "MEDIUM",
      allowNull: false,
    },
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Optional expiry date; announcements past this date won't be shown",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "announcements",
    timestamps: true,
    paranoid: true, // Soft delete
  }
);

module.exports = Announcement;
