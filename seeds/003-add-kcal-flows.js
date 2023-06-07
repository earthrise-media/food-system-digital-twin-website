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
      await knex("kcal_flows").insert(
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
          .filter((row) => row.origin_id !== "Dade")
      );
    } catch (error) {
      console.log(error);
      return;
    }
  }
};
