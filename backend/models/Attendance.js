const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Attendance = sequelize.define(
  "Attendance",
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
    studentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "students",
        key: "id"
      }
    },
    sectionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "class_sections",
        key: "id"
      }
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("PRESENT", "ABSENT", "LATE", "HALF_DAY"),
      allowNull: false,
      defaultValue: "ABSENT"
    },
    recordedBy: {
      type: DataTypes.UUID,
      allowNull: true, // If auto-marked or system
      references: {
        model: "users",
        key: "id"
      }
    },
    isLocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  },
  {
    tableName: "attendances",
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ["schoolId", "studentId", "date"],
        where: {
          deletedAt: null
        }
      }
    ]
  }
);

module.exports = Attendance;
