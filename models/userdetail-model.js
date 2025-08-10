const { DataTypes } = require("sequelize");
const sequelize = require("../connection/db-connection");
const TABLE_NAME = require("../constant/constant");

const userdetail = sequelize.define(TABLE_NAME.Userdetails,
  {
    id: {
        type: DataTypes.INTEGER(11),
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      password: { 
        type: DataTypes.STRING, 
        allowNull: false 
      },
      phone_number: { 
        type: DataTypes.STRING, 
        allowNull: false 
      },
      gender: { 
        type: DataTypes.STRING(255), 
        allowNull: false 
      },
      role: {
        type: DataTypes.ENUM("USER", "ADMIN", "GUEST"),
        defaultValue: "USER",
        allowNull: false
      },
      token: { 
        type: DataTypes.STRING, 
        allowNull: true
      },
      is_deleted: { 
        type: DataTypes.BOOLEAN, 
        defaultValue: false,
        allowNull: false
      },
      createdAt: { 
        type: DataTypes.DATE, 
        allowNull: false
      },
      updatedAt: { 
        type: DataTypes.DATE, 
        allowNull: false
      }
  },
  {
    tableName: TABLE_NAME.Userdetails,
    timestamps: true,
  }
);

module.exports = userdetail;
