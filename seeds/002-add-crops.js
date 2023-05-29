const path = require("path");
const fs = require("fs-extra");
const { APP_DATA_DIR } = require("../config");

const CROPS_CSV_PATH = path.join(APP_DATA_DIR, "cdl-codes.csv");

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
        const [
          id,
          crop_code,
          name,
          Erdas_Red,
          Erdas_Green,
          Erdas_Blue,
          ESRI_Red,
          ESRI_Green,
          ESRI_Blue,
        ] = row.split(",");
        return {
          id,
          name: name.trim(),
          meta: {
            crop_code,
            Erdas_Red: parseFloat(Erdas_Red),
            Erdas_Green: parseFloat(Erdas_Green),
            Erdas_Blue: parseFloat(Erdas_Blue),
            ESRI_Red: parseFloat(ESRI_Red),
            ESRI_Green: parseFloat(ESRI_Green),
            ESRI_Blue: parseFloat(ESRI_Blue),
          },
        };
      })
      .filter((row) => row.name !== "")
  );
};
