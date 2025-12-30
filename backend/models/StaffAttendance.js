const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const StaffAttendance = sequelize.define(
    "StaffAttendance",
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
        staffId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "staff_profiles",
                key: "id",
            },
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM("PRESENT", "ABSENT", "LATE", "HALF_DAY", "LEAVE"),
            allowNull: false,
            defaultValue: "PRESENT",
        },
        checkInTime: {
            type: DataTypes.TIME,
            allowNull: true,
        },
        checkOutTime: {
            type: DataTypes.TIME,
            allowNull: true,
        },
        remarks: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        tableName: "staff_attendances",
        timestamps: true,
        paranoid: true,
        indexes: [
            {
                unique: true,
                fields: ["schoolId", "staffId", "date"],
                where: {
                    deletedAt: null,
                },
            },
        ],
    }
);

module.exports = StaffAttendance;
