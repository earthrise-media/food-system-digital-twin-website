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
  const countiesTopo = JSON.parse(countiesRaw);
  const features = feature(countiesTopo, countiesTopo.objects.counties).features;
  const counties = featureCollection(features);

  const mapStylePath = path.join(process.cwd(), "data/mapStyle.json");
  const mapStyleRaw = await fs.readFile(mapStylePath, "utf-8");
  const mapStyle = JSON.parse(mapStyleRaw);

  return { counties, mapStyle };
}
