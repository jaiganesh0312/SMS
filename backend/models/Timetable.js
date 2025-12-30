const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Timetable = sequelize.define(
  "Timetable",
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
    classId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "classes",
        key: "id",
      },
    },
    subjectId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "subjects",
        key: "id",
      },
    },
    teacherId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users", // Linking to User (Role=Teacher) or StaffProfile?
        // User is safer as StaffProfile might not always exist for pure teachers depending on model. 
        // But StaffProfile is better for domain. 
        // Plan said teacherId. Let's link to StaffProfile for strictness, or User if simplified.
        // Implementation Plan: "Timetable: ... teacherId"
        // I will link to User (Role=TEACHER) as it's the primary identity.
        key: "id",
      },
    },
    dayOfWeek: {
      type: DataTypes.ENUM("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"),
      allowNull: false,
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    classroom: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Room number or location",
    },
  },
  {
    tableName: "timetables",
    timestamps: true,
    paranoid: true,
  }
);

module.exports = Timetable;
