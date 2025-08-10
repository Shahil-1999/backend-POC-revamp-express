"use strict";
const TABLES = require("../constant/constant");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
async up(queryInterface, Sequelize) {
    await queryInterface.createTable(TABLES.Files, {
      id: { 
        type: Sequelize.INTEGER(11), 
        autoIncrement: true, 
        primaryKey: true 
      },
      filename: { 
        type: Sequelize.STRING(255), 
        allowNull: false 
      },
      fileLink: { 
        type: Sequelize.TEXT, 
        allowNull: false 
      },
      user_name: { 
        type: Sequelize.STRING(255), 
        allowNull: false 
      },
      userDetailsId: {
        type: Sequelize.INTEGER(11),
        allowNull: true,
      },
      is_deleted: { 
        type: Sequelize.BOOLEAN, 
        defaultValue: false,
        allowNull: false 
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
    await queryInterface.dropTable(TABLES.Files);
  },
};
