import { promises as fs } from "fs";
import path from "path";

export async function getLocalData() {
  const countiesPath = path.join(
    process.cwd(),
    "data/population_counties_conus.geojson"
  );
  const countiesRaw = await fs.readFile(countiesPath, "utf-8");
  const counties = JSON.parse(countiesRaw) 
  return counties;
}
