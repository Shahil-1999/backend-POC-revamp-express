"use strict";
const TABLES = require("../constant/constant");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
async up(queryInterface, Sequelize) {
    await queryInterface.createTable(TABLES.Comments, {
      id: { 
        type: Sequelize.INTEGER(11), 
        autoIncrement: true, 
        primaryKey: true 
      },
      comments: { 
        type: Sequelize.STRING(255), 
        allowNull: false 
      },
      postID: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
      },
      userDetailsId: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
      },
      user_name: { 
        type: Sequelize.STRING(255), 
        allowNull: false 
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
    await queryInterface.dropTable(TABLES.Comments);
  },
};
