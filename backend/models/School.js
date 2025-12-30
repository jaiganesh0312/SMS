const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const School = sequelize.define(
  "School",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    board: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "e.g., CBSE, ICSE, State Board",
    },
    academicYear: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "e.g., 2024-2025",
    },
    status: {
      type: DataTypes.ENUM("PENDING", "ACTIVE", "INACTIVE"),
      defaultValue: "PENDING",
    },
  },
  {
    tableName: "schools",
    timestamps: true,
    paranoid: true, // Soft delete
  }
);

module.exports = School;
