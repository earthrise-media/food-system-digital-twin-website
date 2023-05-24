const db = require("../../../../helpers/db");

export default async function handler(req, res) {
  const { countyId } = req.query;

  // Get target county
  const county = await db("counties")
    .select(
      "id",
      db.raw("properties->>'name' as name"),
      db.raw("ST_AsGeoJSON(ST_Centroid(geom)) as centroid")
    )
    .where("id", countyId)
    .first();

  // Get inbound counties
  const inboundCounties = await db("counties")
    .select(
      "id",
      db.raw("properties->>'name' as name"),
      db.raw("ST_AsGeoJSON(ST_Centroid(geom)) as centroid")
    )
    .orderByRaw("random()")
    .limit(5);

  // Get flow types
  const flowTypes = await db("flow_types").select("id");

  // Generate randomized flows
  const flows = {
    county: {
      ...county,
      centroid: JSON.parse(county.centroid),
    },
    inbound: [...inboundCounties].map((county) => ({
      ...county,
      centroid: JSON.parse(county.centroid),
      flows: flowTypes.reduce((acc, { id }) => {
        acc[id] = Math.random() * 1000;
        return acc;
      }, {}),
    })),
  };

  return res.status(200).json({ flows });
}
