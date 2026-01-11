const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const ClassSection = sequelize.define(
    "ClassSection",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        classId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "classes",
                key: "id",
            },
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: "e.g., A, B, Red",
        },
        classTeacherId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "users",
                key: "id",
            },
        },
    },
    {
        tableName: "class_sections",
        timestamps: true,
        paranoid: true,
        indexes: [
            {
                unique: true,
                fields: ["classId", "name"],
                where: {
                    deletedAt: null,
                },
            },
        ],
    }
);

module.exports = ClassSection;
