import { getStats, groupFlowsByCounty } from "./util";

const db = require("../../../../helpers/db");

export default async function handler(req, res) {
  const { countyId } = req.query;

  // Get inbound kcal flows for target county
  const outbound = await db("kcal_flows")
    .select(
      "kcal_flows.destination_id as county_id",
      db.raw("counties.properties->>'name' as county_name"),
      db.raw("ST_AsGeoJSON(ST_Centroid(counties.geom)) as county_centroid"),
      "kcal_flows.crop_id as crop_id",
      "crops.name as crop_name",
      "crops.category as crop_category",
      "kcal_flows.value"
    )
    .where("kcal_flows.origin_id", countyId)
    .join("counties", "kcal_flows.destination_id", "=", "counties.id")
    .join("crops", "kcal_flows.crop_id", "=", "crops.id")
    .orderBy("kcal_flows.value", "desc");

  const destinationIds = [...new Set(outbound.map((f) => f.county_id))];

  const routes = await db("routes")
    .select("routes.origin_id", "routes.destination_id", "polyline")
    .where("routes.origin_id", countyId)
    .andWhere("routes.destination_id", "in", destinationIds);

  return res.status(200).json({
    outbound: groupFlowsByCounty(outbound).map((f) => ({
      ...f,
      county_centroid: JSON.parse(f.county_centroid),
      route_geometry: routes.find((r) => r.destination_id === f.county_id)
        ?.polyline,
    })),
    stats: getStats(outbound),
  });
}
