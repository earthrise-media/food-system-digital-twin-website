import { promises as fs } from "fs";
import path from "path";
import { feature } from "topojson-client";
import { featureCollection } from "@turf/helpers";

export async function getLocalData() {
  const countiesPath = path.join(
    process.cwd(),
    "data/counties.topo.json"
  );
  const countiesRaw = await fs.readFile(countiesPath, "utf-8");
  const counties = JSON.parse(countiesRaw);
  const features = feature(counties, counties.objects.counties).features;
  const geojson = featureCollection(features);

  return geojson;
}
