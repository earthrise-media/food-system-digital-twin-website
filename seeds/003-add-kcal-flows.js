const path = require("path");
const fs = require("fs-extra");
const postgis = require("knex-postgis");
const { KCAL_FLOWS_DIR, APP_DATA_DIR } = require("../config");

// Generate absolute paths
const CROPS_CSV_PATH = path.join(APP_DATA_DIR, "crops.csv");
const COUNTIES_FILE_PATH = path.join(
  APP_DATA_DIR,
  "county-population-consumption-production-scaled.geojson"
);

exports.seed = async function (knex) {
  /**
   * CLEAR FLOWS, CROPS, AND COUNTIES TABLES
   */
  await knex.raw("TRUNCATE TABLE kcal_flows RESTART IDENTITY CASCADE");
  await knex.raw("TRUNCATE TABLE crops RESTART IDENTITY CASCADE");
  await knex.raw("TRUNCATE TABLE counties RESTART IDENTITY CASCADE");

  /**
   * INGEST COUNTIES
   */
  const { features: counties } = await fs.readJson(COUNTIES_FILE_PATH);
  await knex.batchInsert(
    "counties",
    counties.map((county) => ({
      id: county.properties.geography.slice(-5),
      properties: county.properties,
      geom: postgis(knex).geomFromGeoJSON(county.geometry),
    })),
    500
  );

  /**
   * INGEST CROP CODES
   */
  const cropCodes = await fs.readFile(CROPS_CSV_PATH, "utf-8");

  // Split CSV into rows
  const rows = cropCodes.split("\n");

  // Remove header row
  rows.shift();

  // Batch insert crop codes
  await knex("crops").insert(
    rows
      .map((row) => {
        const [id, name, category] = row.split(",");
        return {
          id,
          name: name.trim(),
          category,
        };
      })
      .filter((row) => row.name !== "")
  );

  /**
   * INGEST KCAL FLOWS
   */
  const files = (await fs.readdir(KCAL_FLOWS_DIR)).filter((file) =>
    file.endsWith(".csv")
  );

  for (const file of files) {
    // Extract id from filename
    const crop_name = file
      .replace("kcal_produced_", "")
      .replace("_results_df.csv", "");

    const { id: crop_id } = await knex("crops")
      .where("name", crop_name)
      .select("id")
      .first();

    // Load CSV file
    const kcalFlows = await fs.readFile(
      path.join(KCAL_FLOWS_DIR, file),
      "utf-8"
    );
    console.log(`Ingesting ${path.join(KCAL_FLOWS_DIR, file)}`);

    // Split CSV into rows
    const rows = kcalFlows.split("\n").filter((row) => row !== "");

    // Remove header row
    rows.shift();

    // Batch insert kcal flows
    try {
      await knex.batchInsert(
        "kcal_flows",
        rows
          .map((row) => {
            const [origin_id, destination_id, value] = row.split(",");

            if (!origin_id || !destination_id || !value) {
              console.log("Skipping row", row);
              return null;
            }

            return {
              origin_id,
              destination_id,
              crop_id,
              value,
            };
          })
          .filter((row) => row.origin_id !== "Dade"),
        500
      );
    } catch (error) {
      console.log(error);
      return;
    }
  }
};
