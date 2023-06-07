const path = require("path");
const fs = require("fs-extra");
const { APP_DATA_DIR } = require("../config");

const CROPS_CSV_PATH = path.join(APP_DATA_DIR, "crops.csv");

exports.seed = async function (knex) {
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
};
