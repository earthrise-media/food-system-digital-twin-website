const path = require("path");
const fs = require("fs-extra");
const postgis = require("knex-postgis");
const { APP_DATA_DIR } = require("../config");

// Generate absolute paths to the input file
const COUNTIES_FILE_PATH = path.join(
  APP_DATA_DIR,
  "county-population-consumption-production-scaled.geojson"
);

exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex("kcal_flows").del();
  await knex("crops").del();
  await knex("counties").del();

  // Load GeoJSON file
  const { features: counties } = await fs.readJson(COUNTIES_FILE_PATH);

  // Batch insert counties
  await knex("counties").insert(
    counties.map((county) => ({
      id: county.properties.geography.slice(-5),
      properties: county.properties,
      geom: postgis(knex).geomFromGeoJSON(county.geometry),
    }))
  );
};
