const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const StudyMaterialSection = sequelize.define(
    "StudyMaterialSection",
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
        classId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "classes",
                key: "id",
            },
        },
        sectionId: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "Section like A, B, C or null for all sections",
        },
        subjectId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "subjects",
                key: "id",
            },
        },
        createdBy: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "users",
                key: "id",
            },
        },
        isPublished: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        order: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    },
    {
        tableName: "study_material_sections",
        timestamps: true,
        paranoid: true,
    }
);

module.exports = StudyMaterialSection;
