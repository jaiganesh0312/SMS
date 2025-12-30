const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Bus = sequelize.define(
    "Bus",
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
        busNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: "Display number for the bus (e.g., BUS-001)",
        },
        registrationNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: "Vehicle registration plate number",
        },
        driverId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "users",
                key: "id",
            },
            comment: "Staff member assigned as driver",
        },
        deviceId: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "GPS device or mobile device identifier",
        },
        capacity: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 40,
            comment: "Seating capacity of the bus",
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        tableName: "buses",
        timestamps: true,
        paranoid: true,
        indexes: [
            {
                unique: true,
                fields: ["schoolId", "busNumber"],
                where: {
                    deletedAt: null,
                },
            },
            {
                unique: true,
                fields: ["schoolId", "registrationNumber"],
                where: {
                    deletedAt: null,
                },
            },
        ],
    }
);

module.exports = Bus;
