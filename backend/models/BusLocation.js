const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const BusLocation = sequelize.define(
    "BusLocation",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        busId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "buses",
                key: "id",
            },
        },
        tripId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "bus_trips",
                key: "id",
            },
            comment: "Optional link to active trip for historical tracking",
        },
        lat: {
            type: DataTypes.DECIMAL(10, 8),
            allowNull: false,
        },
        lng: {
            type: DataTypes.DECIMAL(11, 8),
            allowNull: false,
        },
        speed: {
            type: DataTypes.FLOAT,
            allowNull: true,
            comment: "Speed in km/h",
        },
        heading: {
            type: DataTypes.FLOAT,
            allowNull: true,
            comment: "Direction in degrees (0-360)",
        },
        accuracy: {
            type: DataTypes.FLOAT,
            allowNull: true,
            comment: "GPS accuracy in meters",
        },
        timestamp: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: "bus_locations",
        timestamps: true,
        indexes: [
            {
                fields: ["busId", "timestamp"],
            },
            {
                fields: ["tripId"],
            },
        ],
    }
);

module.exports = BusLocation;
