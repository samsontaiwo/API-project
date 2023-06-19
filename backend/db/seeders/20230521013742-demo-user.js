"use strict";
const bcrypt = require("bcryptjs");
/** @type {import('sequelize-cli').Migration} */
let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA;
}
module.exports = {
  async up(queryInterface, Sequelize) {
    options.tableName = "Users";
    return queryInterface.bulkInsert(
      options,
      [
        {
          firstName: "samson",
          lastName: "taiwo",
          email: "samsont@user.toe",
          username: "samsontaiwo",
          hashedPassword: bcrypt.hashSync("password"),
        },
        {
          firstName: "mouse",
          lastName: "board",
          email: "mouseb@user.toe",
          username: "mouseboard",
          hashedPassword: bcrypt.hashSync("password"),
        },
        {
          firstName: "bottle",
          lastName: "cap",
          email: "bottlec@user.toe",
          username: "bottlecap",
          hashedPassword: bcrypt.hashSync("password"),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    options.tableName = "Users";
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(
      options,
      {
        username: { [Op.in]: ["samsontaiwo", "mouseboard", "bottlecap"] },
      },
      {}
    );
  },
};
