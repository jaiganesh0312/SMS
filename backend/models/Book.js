const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const { Op } = require("sequelize");

const Book = sequelize.define(
    "Book",
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
        sectionId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "library_sections",
                key: "id",
            },
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        author: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        isbn: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        publisher: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        category: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        available: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: "books",
        timestamps: true,
        paranoid: true,
        indexes: [
            {
                unique: true,
                fields: ["schoolId", "isbn"],
                where: {
                    deletedAt: null,
                    isbn: { [Op.ne]: null } // Only unique if ISBN is not null
                }
            },
        ],
    }
);

module.exports = Book;
