const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const FeePayment = sequelize.define(
  "FeePayment",
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
    feeStructureId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "fee_structures",
        key: "id"
      }
    },
    amountPaid: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    paymentDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    transactionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    paymentMethod: {
      type: DataTypes.ENUM("CASH", "ONLINE", "CHEQUE"),
      defaultValue: "CASH"
    },
    status: {
      type: DataTypes.ENUM("SUCCESS", "FAILED", "PENDING"),
      defaultValue: "SUCCESS" // If manual entry, usually success
    }
  },
  {
    tableName: "fee_payments",
    timestamps: true,
    paranoid: true,
  }
);

module.exports = FeePayment;
