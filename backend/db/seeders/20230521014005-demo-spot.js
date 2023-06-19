"use strict";

/** @type {import('sequelize-cli').Migration} */
let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA;
}
module.exports = {
  async up(queryInterface, Sequelize) {
    options.tableName = "Spots";
    return queryInterface.bulkInsert(
      options,
      [
        {
          ownerId: 1,
          address: "13503 Bonilla Ln",
          city: "Houston",
          state: "TX",
          country: "USA",
          lat: 13.5678,
          lng: -99.9999,
          name: "House",
          description: "A house for a family",
          price: 200000,
        },
        {
          ownerId: 2,
          address: "045 Cheapstake Str",
          city: "Boston",
          state: "MA",
          country: "USA",
          lat: 12.3456,
          lng: -86.4325,
          name: "The Experience",
          description: "A virtual reality building for experiencing",
          price: 5000000,
        },
        {
          ownerId: 3,
          address: "123 orange avenue",
          city: "New York City",
          state: "NY",
          country: "USA",
          lat: 52.8900,
          lng: -43.7122,
          name: "La Cafe",
          description: "An amazing restaurant",
          price: 500000,
        },
        {
          ownerId: 3,
          address: "998 Mango str",
          city: "Los Angeles",
          state: "CA",
          country: "USA",
          lat: 23.6423,
          lng: -34.6673,
          name: "The Stadium",
          description: "A stadium for soccer",
          price: 1000,
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    options.tableName = "Spots";
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(
      options,
      {
        ownerId: { [Op.in]: [1, 2, 3] },
      },
      {}
    );
  },
};
