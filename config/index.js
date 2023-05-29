const path = require("path");
const BASE_PATH = path.resolve();

const APP_DATA_DIR =
  process.env.APP_DATA_DIR || path.join(BASE_PATH, "..", "app-data");

const KCAL_FLOWS_DIR = path.join(APP_DATA_DIR, "kcal-flows");

module.exports = {
  APP_DATA_DIR,
  KCAL_FLOWS_DIR,
};
