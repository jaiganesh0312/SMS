const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Gallery = sequelize.define(
    "Gallery",
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
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        eventDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
    },
    {
        tableName: "galleries",
        timestamps: true,
        paranoid: true,
    }
);

module.exports = Gallery;
