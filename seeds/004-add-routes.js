const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { APP_DATA_DIR } = require("../config");

const ROUTES_PATH = path.join(APP_DATA_DIR, "complete_routes.geojson");

exports.seed = async function (knex) {
  await knex.raw("TRUNCATE TABLE routes RESTART IDENTITY CASCADE");

  const readStream = fs.createReadStream(ROUTES_PATH);
  const rl = readline.createInterface({
    input: readStream,
    crlfDelay: Infinity,
  });

  const batchSize = 10000;
  let batch = [];
  let featuresCount = 0;
  let linesCount = 0;
  const nonFeatureLines = [];

  const processBatch = async (batch) => {
    const transformedBatch = batch.map((line) => {
      const feature = JSON.parse(line.slice(0, -1));

      const encodedPolyline = feature.properties.polyline;

      return {
        origin_id: feature.properties.start_geoid,
        destination_id: feature.properties.end_geoid,
        geom: knex.raw("ST_LineFromEncodedPolyline(:encodedPolyline)", {
          encodedPolyline,
        }),
      };
    });

    featuresCount += transformedBatch.length;

    console.time(`Processed ${featuresCount} features`);
    await knex.batchInsert("routes", transformedBatch, batchSize);
    console.timeEnd(`Processed ${featuresCount} features`);
  };

  for await (const line of rl) {
    if (line.indexOf('{ "type": "Feature"') !== -1) {
      batch.push(line);
    } else {
      nonFeatureLines.push(linesCount);
    }

    if (batch.length === batchSize) {
      await processBatch(batch);
      batch = [];
    }

    linesCount++;
  }

  if (batch.length > 0) {
    await processBatch(batch);
  }

  console.log(`Total lines processed: ${linesCount}`);
  console.log(`Non-feature lines: ${nonFeatureLines.join(", ")}`);
  console.log(`Total features processed: ${featuresCount}`);
};
