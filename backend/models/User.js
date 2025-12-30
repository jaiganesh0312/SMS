const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    schoolId: {
      type: DataTypes.UUID,
      allowNull: true, // Super Admin may not belong to a school
      references: {
        model: "schools",
        key: "id",
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("SUPER_ADMIN", "SCHOOL_ADMIN", "STAFF", "TEACHER", "PARENT", "LIBRARIAN", "BUS_DRIVER"),
      allowNull: false,
      defaultValue: "STAFF",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "users",
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ["schoolId", "email"],
        where: {
          deletedAt: null
        }
      },
    ],
  }
);

module.exports = User;
