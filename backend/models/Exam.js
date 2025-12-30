const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Exam = sequelize.define(
  "Exam",
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
            key: "id"
        }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "e.g., Mid-Term, Final, Unit Test 1",
    },
    type: {
        type: DataTypes.ENUM("UNIT_TEST", "HALF_YEARLY", "FINAL", "OTHER"),
        defaultValue: "UNIT_TEST"
    },
    startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    endDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
  },
  {
    tableName: "exams",
    timestamps: true,
    paranoid: true,
  }
);

module.exports = Exam;
