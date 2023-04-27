const path = require("path");
const fs = require("fs-extra");
const postgis = require("knex-postgis");

// Generate absolute paths to the GeoJSON files in the local filesystem
const BASE_PATH = path.resolve();
const COUNTIES_GEOJSON_PATH = path.join(
  BASE_PATH,
  "data",
  "population_counties_conus.geojson"
);

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable("counties", (table) => {
    table.integer("id").primary();
    table.jsonb("meta");
    table.geography("geom", "4326");
  });

  // Load GeoJSON file
  const { features: counties } = await fs.readJSON(COUNTIES_GEOJSON_PATH);

  // Batch insert counties
  await knex("counties").insert(
    counties.map((county) => ({
      id: county.properties.geoid,
      meta: county.properties,
      geom: postgis(knex).geomFromGeoJSON(county.geometry),
    }))
  );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTable("counties");
};
