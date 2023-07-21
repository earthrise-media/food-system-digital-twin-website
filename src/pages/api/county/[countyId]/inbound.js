import { getStats, getSymmetricRoutes, groupFlowsByCounty } from "./util";

const db = require("../../../../helpers/db");

export default async function handler(req, res) {
  const { countyId } = req.query;

  if (!countyId) return res.status(404).json({ message: "Missing countyId" });

  // Get inbound kcal flows for target county
  const inbound = await db("kcal_flows")
    .select(
      "kcal_flows.origin_id as county_id",
      db.raw("counties.properties->>'name' as county_name"),
      db.raw("ST_AsGeoJSON(ST_Centroid(counties.geom)) as county_centroid"),
      "kcal_flows.crop_id as crop_id",
      "crops.name as crop_name",
      "crops.category as crop_category",
      "kcal_flows.value"
    )
    .where("kcal_flows.destination_id", countyId)
    .join("counties", "kcal_flows.origin_id", "=", "counties.id")
    .join("crops", "kcal_flows.crop_id", "=", "crops.id")
    .orderBy("kcal_flows.value", "desc");

  const originsIds = [...new Set(inbound.map((f) => f.county_id))];

  const routes = await getSymmetricRoutes(countyId, originsIds);

  // TODO replace with real values
  const inboundWithAdverseConditions = inbound.map((f) => ({
    ...f,
    value_drought: Math.round(f.value * (0.5 + 0.5 * Math.random())),
    value_heat_stress: Math.round(f.value * (0.5 + 0.5 * Math.random())),
  }));

  return res.status(200).json({
    inbound: groupFlowsByCounty(inboundWithAdverseConditions).map((f) => ({
      ...f,
      county_centroid: JSON.parse(f.county_centroid),
      route_geometry: routes.find((r) => r.origin_id === f.county_id)?.polyline,
    })),
    stats: getStats(inboundWithAdverseConditions),
  });
}
