const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const GalleryImage = sequelize.define(
    "GalleryImage",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        galleryId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "galleries",
                key: "id",
            },
            onDelete: "CASCADE",
        },
        imageUrl: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        tableName: "gallery_images",
        timestamps: true,
        paranoid: true,
    }
);

module.exports = GalleryImage;
