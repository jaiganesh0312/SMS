const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const GradeRule = sequelize.define(
  "GradeRule",
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
    grade: {
        type: DataTypes.STRING,
        allowNull: false, // e.g. "A+"
    },
    minPercentage: {
        type: DataTypes.FLOAT,
        allowNull: false, // e.g. 90
    },
    maxPercentage: {
        type: DataTypes.FLOAT,
        allowNull: false, // e.g. 100
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true // e.g. "Excellent"
    }
  },
  {
    tableName: "grade_rules",
    timestamps: true,
    paranoid: true,
    indexes: [
        {
            unique: true,
            fields: ["schoolId", "grade"],
            where: {
                deletedAt: null
            }
        }
    ]
  }
);

module.exports = GradeRule;
