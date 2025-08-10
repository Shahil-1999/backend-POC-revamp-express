"use strict";
const TABLES = require("../constant/constant");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
async up(queryInterface, Sequelize) {
      await queryInterface.createTable(TABLES.Subscriptions, {
      id: { 
        type: Sequelize.INTEGER(11), 
        autoIncrement: true, 
        primaryKey: true 
      },
      planName: { 
        type: Sequelize.STRING(255), 
        defaultValue: 'Free_Trial',
        allowNull: false
      },
      price: { 
        type: Sequelize.FLOAT, 
        allowNull: false 
      },
      startDate: { 
        type: Sequelize.DATE, 
        allowNull: false 
      },
      endDate: { 
        type: Sequelize.DATE, 
        allowNull: false 
      },
      status: { 
        type: Sequelize.STRING(255), 
        defaultValue: 'active',
        allowNull: false
      },
      userDetailsId: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
      },
      is_deleted: { 
        type: Sequelize.BOOLEAN,
        defaultValue: false 
      },
      createdAt: { 
        type: Sequelize.DATE, 
        allowNull: false
      },
      updatedAt: { 
        type: Sequelize.DATE, 
        allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable(TABLES.Subscriptions);
  },
};
