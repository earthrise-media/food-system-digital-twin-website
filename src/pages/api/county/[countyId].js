const db = require("../../../helpers/db");

export default async function handler(req, res) {
  const { countyId } = req.query;

  // Query county
  const county = await db("counties")
    .select("id", "meta")
    .where("id", countyId)
    .first();

  return res.status(200).json({ county: { id: county.id, ...county.meta } });
}
