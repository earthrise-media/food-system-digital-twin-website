const db = require("../../../../helpers/db");

/**
 * @swagger
 *   /county/{countyId}:
 *     parameters:
 *       - $ref: '#/components/parameters/CountyId'
 *     get:
 *       summary: get a county by id
 *       tags:
 *         - counties
 *       responses:
 *         '200':
 *           description: County is retrieved
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/County'
 */
export default async function handler(req, res) {
  const { countyId } = req.query;

  // Query county
  const county = await db("counties")
    .select(
      "id",
      "properties",
      db.raw("ST_AsGeoJSON(ST_Centroid(geom)) as centroid")
    )
    .where("id", countyId)
    .first();

  return res
    .status(200)
    .json({ ...county, centroid: JSON.parse(county.centroid) });
}
