const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const FeeStructure = sequelize.define(
  "FeeStructure",
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
      allowNull: false, // e.g. "Tuition Fee", "Transport Fee"
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    frequency: {
        type: DataTypes.ENUM("MONTHLY", "YEARLY", "ONE_TIME", "QUARTERLY"),
        defaultValue: "MONTHLY"
    },
    dueDate: {
        type: DataTypes.STRING, // e.g., "5th of every month" or specific date logic
        allowNull: true
    }
  },
  {
    tableName: "fee_structures",
    timestamps: true,
    paranoid: true,
  }
);

module.exports = FeeStructure;
