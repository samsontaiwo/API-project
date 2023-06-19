"use strict";

/** @type {import('sequelize-cli').Migration} */
let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA;
}
module.exports = {
  async up(queryInterface, Sequelize) {
    options.tableName = "Bookings";
    return queryInterface.bulkInsert(
      options,
      [
        {
          spotId: 1,
          userId: 1,
          startDate: "2025-06-10",
          endDate: "2025-06-13",
        },
        {
          spotId: 2,
          userId: 2,
          startDate: "2025-06-10",
          endDate: "2025-06-13",
        },
        {
          spotId: 3,
          userId: 3,
          startDate: "2025-06-10",
          endDate: "2025-06-13",
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    options.tableName = "Bookings";
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(
      options,
      {
        startDate: { [Op.in]: ["2025-06-10"] },
      },
      {}
    );
  },
};
