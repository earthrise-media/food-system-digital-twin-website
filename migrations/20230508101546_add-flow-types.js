const path = require("path");
const fs = require("fs-extra");

const BASE_PATH = path.resolve();
const COUNTIES_GEOJSON_PATH = path.join(BASE_PATH, "data", "flow-types.json");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable("flow_types", (table) => {
    table.string("id").primary();
    table.string("name");
  });

  // Load GeoJSON file
  const { flowTypes } = await fs.readJSON(COUNTIES_GEOJSON_PATH);

  // Batch insert counties
  await knex("flow_types").insert(
    flowTypes.map(({ id, name }) => ({
      id,
      name,
    }))
  );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTable("flow_types");
};
