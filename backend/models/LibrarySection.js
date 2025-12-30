const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const LibrarySection = sequelize.define(
    "LibrarySection",
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
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        location: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        tableName: "library_sections",
        timestamps: true,
        paranoid: true,
        indexes: [
            {
                unique: true,
                fields: ["schoolId", "name"],
                where: {
                    deletedAt: null
                }
            },
        ],
    }
);

module.exports = LibrarySection;
