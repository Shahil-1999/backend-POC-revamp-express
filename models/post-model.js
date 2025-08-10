const { DataTypes } = require("sequelize");
const sequelize = require("../connection/db-connection");
const TABLE_NAME = require("../constant/constant");


const post = sequelize.define(TABLE_NAME.Posts,
  {
    id: { 
        type: DataTypes.INTEGER(11), 
        autoIncrement: true, 
        primaryKey: true 
      },
      title: {
        type: DataTypes.STRING(255), 
        allowNull: false 
      },
      post_description: { 
        type: DataTypes.STRING(255), 
        allowNull: false 
      },
      userDetailsId: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
      },
      user_name: { 
        type: DataTypes.STRING(255), 
        allowNull: false 
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
    tableName: TABLE_NAME.Posts,
    timestamps: true,
  }
);

post.associate = (models) => {
  post.belongsTo(models.UserDetails, {
    foreignKey: "userDetailsId",
  });

  models.UserDetails.hasMany(post, {
    foreignKey: "userDetailsId",
  });
};

module.exports = post;
