import { getStats, getSymmetricRoutes, groupFlowsByCounty } from "./util";

const db = require("../../../../helpers/db");

export default async function handler(req, res) {
  const { countyId } = req.query;

  if (!countyId) return res.status(404).json({ message: "Missing countyId" });

  // Get inbound kcal flows for target county
  const outbound = await db("kcal_flows")
    .select(
      "kcal_flows.destination_id as county_id",
      db.raw("counties.properties->>'name' as county_name"),
      db.raw("ST_AsGeoJSON(ST_Centroid(counties.geom)) as county_centroid"),
      "kcal_flows.crop_id as crop_id",
      "crops.name as crop_name",
      "crops.category as crop_category",
      "kcal_flows.value",
      db.raw(
        `(kcal_flows.impact_ratios->>'drought'::text)::numeric * kcal_flows.value as value_drought`
      ),
      db.raw(
        `(kcal_flows.impact_ratios->>'heat'::text)::numeric * kcal_flows.value as value_heat_stress`
      )
    )
    .where("kcal_flows.origin_id", countyId)
    .join("counties", "kcal_flows.destination_id", "=", "counties.id")
    .join("crops", "kcal_flows.crop_id", "=", "crops.id")
    .orderBy("kcal_flows.value", "desc");

  const destinationIds = [...new Set(outbound.map((f) => f.county_id))];

  const routes = await getSymmetricRoutes(countyId, destinationIds);

  return res.status(200).json({
    outbound: groupFlowsByCounty(outbound).map((f) => {
      const route = routes.find((r) => r.origin_id === f.county_id);
      return {
        ...f,
        county_centroid: JSON.parse(f.county_centroid),
        route_geometry: route?.polyline,
        route_direction: route?.direction,
      };
    }),
    stats: getStats(outbound),
  });
}
