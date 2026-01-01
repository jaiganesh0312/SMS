const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const StudyMaterial = sequelize.define(
    "StudyMaterial",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        studyMaterialSectionId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "study_material_sections",
                key: "id",
            },
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
        type: {
            type: DataTypes.ENUM("VIDEO", "PDF", "PPT"),
            allowNull: false,
        },
        filePath: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: "For PDF/PPT: direct path; For VIDEO: HLS folder path",
        },
        hlsPath: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "Path to master.m3u8 for videos",
        },
        originalFileName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        fileSize: {
            type: DataTypes.BIGINT,
            allowNull: true,
            comment: "File size in bytes",
        },
        duration: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "Video duration in seconds",
        },
        uploadedBy: {
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
        thumbnailPath: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        order: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    },
    {
        tableName: "study_materials",
        timestamps: true,
        paranoid: true,
    }
);

module.exports = StudyMaterial;
