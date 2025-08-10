const { DataTypes } = require("sequelize");
const sequelize = require("../connection/db-connection");
const TABLE_NAME = require("../constant/constant");

const file = sequelize.define(
  TABLE_NAME.Files,
  {
    id: { 
        type: DataTypes.INTEGER(11), 
        autoIncrement: true, 
        primaryKey: true 
      },
      filename: { 
        type: DataTypes.STRING(255), 
        allowNull: false 
      },
      fileLink: { 
        type: DataTypes.TEXT, 
        allowNull: false 
      },
      user_name: { 
        type: DataTypes.STRING(255), 
        allowNull: false 
      },
      userDetailsId: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
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
    tableName: TABLE_NAME.Files,
    timestamps: true,
  }
);

file.associate = (models) => {
  // File belongs to a user
  file.belongsTo(models.UserDetails, {
    foreignKey: "userDetailsId",
  });

  // User has many files
  models.UserDetails.hasMany(file, {
    foreignKey: "userDetailsId",
  });
};

module.exports = file;
