const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Student = sequelize.define(
  "Student",
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
    parentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "parents",
        key: "id",
      },
    },
    classId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "classes",
        key: "id",
      },
    },
    sectionId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "class_sections",
        key: "id",
      },
    },
    admissionNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dob: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    gender: {
      type: DataTypes.ENUM("Male", "Female", "Other"),
      allowNull: false
    },
    profilePicture: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "URL or path to the student profile picture"
    }
  },
  {
    tableName: "students",
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ["schoolId", "admissionNumber"],
        where: {
          deletedAt: null
        }
      },
    ],
  }
);

module.exports = Student;
