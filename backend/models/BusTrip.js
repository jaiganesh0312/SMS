const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const BusTrip = sequelize.define(
    "BusTrip",
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
        busId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "buses",
                key: "id",
            },
        },
        routeId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "bus_routes",
                key: "id",
            },
        },
        tripType: {
            type: DataTypes.ENUM("MORNING", "EVENING", "SPECIAL"),
            allowNull: false,
            defaultValue: "MORNING",
        },
        status: {
            type: DataTypes.ENUM("NOT_STARTED", "IN_PROGRESS", "COMPLETED", "CANCELLED"),
            allowNull: false,
            defaultValue: "NOT_STARTED",
        },
        startTime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        endTime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: "Any notes about the trip (delays, incidents, etc.)",
        },
    },
    {
        tableName: "bus_trips",
        timestamps: true,
        paranoid: true,
        indexes: [
            {
                fields: ["schoolId", "busId", "status"],
            },
            {
                fields: ["startTime"],
            },
        ],
    }
);

module.exports = BusTrip;
