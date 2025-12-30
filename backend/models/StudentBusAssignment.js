const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const StudentBusAssignment = sequelize.define(
    "StudentBusAssignment",
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
        stopName: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "Pickup/dropoff stop name",
        },
        pickupTime: {
            type: DataTypes.TIME,
            allowNull: true,
        },
        dropoffTime: {
            type: DataTypes.TIME,
            allowNull: true,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        tableName: "student_bus_assignments",
        timestamps: true,
        paranoid: true,
        indexes: [
            {
                unique: true,
                fields: ["studentId"],
                where: {
                    deletedAt: null,
                    isActive: true,
                },
            },
            {
                fields: ["busId"],
            },
        ],
    }
);

module.exports = StudentBusAssignment;
