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
      "kcal_flows.value"
    )
    .where("kcal_flows.origin_id", countyId)
    .join("counties", "kcal_flows.destination_id", "=", "counties.id")
    .join("crops", "kcal_flows.crop_id", "=", "crops.id")
    .orderBy("kcal_flows.value", "desc");

  const rank = await db.raw(`
    SELECT origin_id, total_production, rank
    FROM (
        SELECT origin_id, SUM(value) as total_production, 
              RANK() OVER(ORDER BY SUM(value) DESC) as rank
        FROM kcal_flows
        GROUP BY origin_id
    ) as subquery
    WHERE origin_id = '${countyId}'
`);

  const topCrop = await db.raw(`
    WITH crop_ranks AS (
      SELECT 
            crop_id,
            origin_id, 
            RANK() OVER(PARTITION BY crop_id ORDER BY SUM(value) DESC) as rank
        FROM 
            kcal_flows
        GROUP BY 
            crop_id, origin_id
      )
    
    SELECT 
        crop_ranks.crop_id, crop_ranks.rank, crops.name
    FROM 
        crop_ranks
    INNER JOIN
        crops ON crop_ranks.crop_id = crops.id
    WHERE 
        origin_id = '${countyId}'
    ORDER BY 
        rank ASC
    LIMIT 1;
  `);

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
    rank: parseInt(rank.rows[0].rank),
    topCrop: topCrop.rows[0],
  });
}
