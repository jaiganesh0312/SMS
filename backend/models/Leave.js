const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Leave = sequelize.define(
  "Leave",
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
    applicantId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: "users", 
            key: "id"
        }
    },
    role: { // To distinguish if its staff leave or student leave
        type: DataTypes.STRING,
        allowNull: true
    },
    type: {
        type: DataTypes.ENUM("SICK", "CASUAL", "PRIVILEGE", "METERNITY", "OTHER"),
        allowNull: false,
        defaultValue: "CASUAL"
    },
    startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    endDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED"),
        defaultValue: "PENDING"
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: true
    }
  },
  {
    tableName: "leaves",
    timestamps: true,
    paranoid: true
  }
);

module.exports = Leave;
