const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const BusRoute = sequelize.define(
    "BusRoute",
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
        routeName: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: "Display name for the route (e.g., Morning Route A)",
        },
        routeType: {
            type: DataTypes.ENUM("MORNING", "EVENING", "BOTH"),
            allowNull: false,
            defaultValue: "BOTH",
        },
        stops: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: [],
            comment: "Array of stops: [{name, lat, lng, order, estimatedTime}]",
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        tableName: "bus_routes",
        timestamps: true,
        paranoid: true,
        indexes: [
            {
                fields: ["schoolId", "busId"],
            },
        ],
    }
);

module.exports = BusRoute;
