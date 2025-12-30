const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Payroll = sequelize.define(
    "Payroll",
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
        staffId: { // Link to StaffProfile
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "staff_profiles",
                key: "id"
            }
        },
        month: {
            type: DataTypes.STRING, // e.g. "January" or number
            allowNull: false
        },
        year: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        basicSalary: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        allowances: {
            type: DataTypes.JSON,
            defaultValue: []
        },
        deductionsBreakdown: {
            type: DataTypes.JSON,
            defaultValue: {}
        },
        attendanceSummary: {
            type: DataTypes.JSON,
            defaultValue: {}
        },
        bonus: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        deductions: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        netSalary: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM("GENERATED", "PAID"),
            defaultValue: "GENERATED"
        },
        paymentDate: {
            type: DataTypes.DATEONLY,
            allowNull: true
        }
    },
    {
        tableName: "payrolls",
        timestamps: true,
        paranoid: true,
        indexes: [
            {
                unique: true,
                fields: ["schoolId", "staffId", "month", "year"],
                where: {
                    deletedAt: null
                }
            }
        ]
    }
);

module.exports = Payroll;
