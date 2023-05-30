const path = require("path");
const fs = require("fs-extra");
const { KCAL_FLOWS_DIR } = require("../config");

exports.seed = async function (knex) {
  // For each csv file in app-data/kcal-flows
  const files = (await fs.readdir(KCAL_FLOWS_DIR)).filter((file) =>
    file.endsWith(".csv")
  );

  for (const file of files) {
    // Extract id from filename
    const crop_id = file.split("_")[3];

    // Load CSV file
    const kcalFlows = await fs.readFile(
      path.join(KCAL_FLOWS_DIR, file),
      "utf-8"
    );
    console.log(`Ingesting ${path.join(KCAL_FLOWS_DIR, file)}`);

    // Split CSV into rows
    const rows = kcalFlows.split("\n");

    // Remove header row
    rows.shift();

    // Batch insert kcal flows
    try {
      await knex("kcal_flows").insert(
        rows
          .map((row) => {
            const [_, origin_id, destination_id, value] = row.split(",");
            return {
              origin_id,
              destination_id,
              crop_id,
              value,
            };
          })
          .filter((row) => row.origin_id !== "Dade")
      );
    } catch (error) {
      console.log(error?.detail);
    }
  }
};
