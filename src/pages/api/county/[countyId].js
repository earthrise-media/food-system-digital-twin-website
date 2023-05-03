const db = require("../../../helpers/db");

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
    .select("id", "meta")
    .where("id", countyId)
    .first();

  return res.status(200).json({ county: { id: county.id, ...county.meta } });
}
