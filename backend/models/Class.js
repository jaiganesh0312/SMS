const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Class = sequelize.define(
  "Class",
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "e.g., 10, XII, Nursery",
    },
  },
  {
    tableName: "classes",
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ["schoolId", "name"],
        where: {
          deletedAt: null
        }
      },
    ],
  }
);

module.exports = Class;
