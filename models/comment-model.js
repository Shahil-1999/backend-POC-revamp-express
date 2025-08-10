const { DataTypes } = require("sequelize");
const sequelize = require("../connection/db-connection");
const TABLE_NAME = require("../constant/constant");

const comment = sequelize.define(
  TABLE_NAME.Comments,
  {
    id: { 
        type: DataTypes.INTEGER(11), 
        autoIncrement: true, 
        primaryKey: true 
      },
      comments: { 
        type: DataTypes.STRING(255), 
        allowNull: false 
      },
      postID: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
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
    tableName: TABLE_NAME.Comments,
    timestamps: true,
  }
);

comment.associate = (models) => {
  // Comment belongs to a post
  comment.belongsTo(models.Posts, {
    foreignKey: "postID",
  });

  // A post has many comments
  models.Posts.hasMany(comment, {
    foreignKey: "postID",
  });

  // Comment belongs to a user
  comment.belongsTo(models.UserDetails, {
    foreignKey: "userDetailsId",
  });

  // A user has many comments
  models.UserDetails.hasMany(comment, {
    foreignKey: "userDetailsId",
  });
};

module.exports = comment;
