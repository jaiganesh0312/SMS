const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const ExamResult = sequelize.define(
  "ExamResult",
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
    examId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: "exams",
            key: "id"
        }
    },
    studentId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: "students",
            key: "id"
        }
    },
    subjectId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: "subjects",
            key: "id"
        }
    },
    marksObtained: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    maxMarks: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 100
    },
    grade: { // Optional, can be calculated dynamically or stored
        type: DataTypes.STRING,
        allowNull: true
    },
    remarks: {
        type: DataTypes.STRING,
        allowNull: true
    }
  },
  {
    tableName: "exam_results",
    timestamps: true,
    paranoid: true,
    indexes: [
        {
            unique: true,
            fields: ["examId", "studentId", "subjectId"], // One result per subject per exam for a student
            where: {
                deletedAt: null
            }
        }
    ]
  }
);

module.exports = ExamResult;
