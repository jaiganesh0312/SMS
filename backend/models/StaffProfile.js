const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const StaffProfile = sequelize.define(
  "StaffProfile",
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
      unique: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    employeeCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    designation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    joiningDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    workingAs: {
      type: DataTypes.ENUM("TEACHER", "STAFF", "LIBRARIAN"),
      allowNull: false,
      defaultValue: "TEACHER"
    },
    status: {
      type: DataTypes.ENUM("PRE_BOARDING", "ACTIVE", "ON_NOTICE", "RESIGNED", "TERMINATED"),
      allowNull: false,
      defaultValue: "PRE_BOARDING"
    }
  },
  {
    tableName: "staff_profiles",
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ["schoolId", "employeeCode"],
        where: {
          deletedAt: null
        }
      },
    ],
  }
);

module.exports = StaffProfile;
