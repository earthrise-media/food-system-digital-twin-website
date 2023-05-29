const path = require("path");
const fs = require("fs-extra");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  // Add kcal_flows table where origin_id and destination_id are foreign keys
  await knex.schema.createTable("kcal_flows", (table) => {
    table.integer("crop_id").references("crops.id");
    table.string("origin_id").references("counties.id");
    table.string("destination_id").references("counties.id");
    table.float("value");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTable("kcal_flows");
};
