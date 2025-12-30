const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Subject = sequelize.define(
  "Subject",
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "subjects",
    timestamps: true,
    paranoid: true,
    indexes: [
        {
            unique: true,
            fields: ["schoolId", "code"],
            where: {
                deletedAt: null
            }
        }
    ]
  }
);

module.exports = Subject;
