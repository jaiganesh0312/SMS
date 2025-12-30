const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Complaint = sequelize.define(
    "Complaint",
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
            allowNull: false,
            references: {
                model: "parents",
                key: "id",
            },
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM("Open", "In Progress", "Resolved", "Closed"),
            defaultValue: "Open",
        },
        priority: {
            type: DataTypes.ENUM("Low", "Medium", "High"),
            defaultValue: "Medium",
        },
    },
    {
        tableName: "complaints",
        timestamps: true,
        paranoid: true,
    }
);

module.exports = Complaint;
