const { DataTypes } = require("sequelize");
const sequelize = require("../connection/db-connection");
const TABLE_NAME = require("../constant/constant");

const subscription = sequelize.define(
  TABLE_NAME.Subscriptions,
  {
    id: { 
        type: DataTypes.INTEGER(11), 
        autoIncrement: true, 
        primaryKey: true 
      },
      planName: { 
        type: DataTypes.STRING(255), 
        defaultValue: 'Free_Trial',
        allowNull: false
      },
      price: { 
        type: DataTypes.FLOAT, 
        allowNull: false 
      },
      startDate: { 
        type: DataTypes.DATE, 
        allowNull: false 
      },
      endDate: { 
        type: DataTypes.DATE, 
        allowNull: false 
      },
      status: { 
        type: DataTypes.STRING(255), 
        defaultValue: 'active',
        allowNull: false
      },
      userDetailsId: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
      },
      is_deleted: { 
        type: DataTypes.BOOLEAN,
        defaultValue: false 
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
    tableName: TABLE_NAME.Subscriptions,
    timestamps: true,
  }
);

subscription.associate = (models) => {
  // Subscription belongs to a user
  subscription.belongsTo(models.UserDetails, {
    foreignKey: "userDetailsId",
  });

  // User has many subscriptions
  models.UserDetails.hasMany(subscription, {
    foreignKey: "userDetailsId",
  });
};

module.exports = subscription;
