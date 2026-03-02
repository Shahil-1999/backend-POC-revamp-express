"use strict";
const TABLES = require("../constant/constant");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(TABLES.RefreshTokens, {
      id: {
        type: Sequelize.INTEGER(11),
        autoIncrement: true,
        primaryKey: true,
      },

      userDetailsId: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
      },

      token_hash: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },

      token_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },

      revoked: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },

      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable(TABLES.RefreshTokens);
  },
};