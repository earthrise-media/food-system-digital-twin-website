const path = require("path");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  // Create postgis extension
  await knex.raw("CREATE EXTENSION IF NOT EXISTS postgis");

  // Create counties table
  await knex.schema.createTable("counties", (table) => {
    table.string("id").primary();
    table.jsonb("properties");
    table.geography("geom", "4326");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTable("counties");
};
