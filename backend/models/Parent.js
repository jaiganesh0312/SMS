const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Parent = sequelize.define(
  "Parent",
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
      unique: true, // One User -> One Parent Profile
      references: {
        model: "users",
        key: "id",
      },
    },
    guardianName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    occupation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "parents",
    timestamps: true,
    paranoid: true,
  }
);

module.exports = Parent;
