"use strict";
const TABLES = require("../constant/constant");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(TABLES.Userdetails, {
      id: {
        type: Sequelize.INTEGER(11),
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      password: { 
        type: Sequelize.STRING, 
        allowNull: false 
      },
      phone_number: { 
        type: Sequelize.STRING, 
        allowNull: false 
      },
      gender: { 
        type: Sequelize.STRING(255), 
        allowNull: false 
      },
      role: {
        type: Sequelize.ENUM("USER", "ADMIN", "GUEST"),
        defaultValue: "USER",
        allowNull: false
      },
      token: { 
        type: Sequelize.STRING, 
        allowNull: true
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
    await queryInterface.dropTable(TABLES.Userdetails);
  },
};
