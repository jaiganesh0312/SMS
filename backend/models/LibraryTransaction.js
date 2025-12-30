const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const LibraryTransaction = sequelize.define(
    "LibraryTransaction",
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
        bookId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "books",
                key: "id",
            },
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "users",
                key: "id",
            },
        },
        studentId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "students",
                key: "id",
            },
        },
        issueDate: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        dueDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        returnDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "ISSUED",
            validate: {
                isIn: [["ISSUED", "RETURNED"]],
            },
        },
        fineAmount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 0.00,
        },
        remarks: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        tableName: "library_transactions",
        timestamps: true,
        paranoid: true,
        indexes: [
            {
                fields: ["schoolId"],
            },
            {
                fields: ["bookId"],
            },
            {
                fields: ["userId"],
            },
            {
                fields: ["studentId"],
            },
            {
                fields: ["status"],
            },
        ],
    }
);

module.exports = LibraryTransaction;
