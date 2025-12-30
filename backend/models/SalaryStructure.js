const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const SalaryStructure = sequelize.define(
    "SalaryStructure",
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
        basicSalary: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0,
        },
        allowances: {
            type: DataTypes.JSON, // Stores array of objects: [{ name: "HRA", amount: 5000 }, ...]
            allowNull: true,
            defaultValue: [],
        },
        deductions: {
            type: DataTypes.JSON, // Stores array of objects: [{ name: "PF", amount: 1800 }, ...]
            allowNull: true,
            defaultValue: [],
        },
        netSalary: {
            type: DataTypes.FLOAT, // Calculated base net salary (for reference)
            allowNull: true
        },
        effectiveDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    },
    {
        tableName: "salary_structures",
        timestamps: true,
        paranoid: true,
    }
);

module.exports = SalaryStructure;
