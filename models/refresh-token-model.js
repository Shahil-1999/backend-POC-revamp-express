const { DataTypes } = require("sequelize");
const sequelize = require("../connection/db-connection");
const TABLE_NAME = require("../constant/constant");

const file = sequelize.define(
  TABLE_NAME.RefreshTokens,
  {
    id: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
    },
    userDetailsId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
    },
    token_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    token_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    revoked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: TABLE_NAME.RefreshTokens,
    timestamps: true,
  },
);

file.associate = (models) => {
  // Refresh token belongs to a user
  file.belongsTo(models.UserDetails, {
    foreignKey: "userDetailsId",
  });

  // User has many refresh tokens
  models.UserDetails.hasMany(file, {
    foreignKey: "userDetailsId",
  });
};

module.exports = file;
