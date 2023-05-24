import * as Yup from "yup";
import db from "../../../../helpers/db";

const validationSchema = Yup.object({
  countyId: Yup.number().required().positive().integer().required(),
  to: Yup.string()
    .test(
      "is-array-of-integers",
      "must be an array of integers separated by comma",
      (value) => {
        if (!value) return true;
        const regex = /^\d+(,\d+)*$/;
        return regex.test(value);
      }
    )
    .required(),
});

async function handler(req, res) {
  const { countyId, to } = await validationSchema.validate(req.query);

  // Get target county
  const origin = await db("counties")
    .select(
      "id",
      db.raw("properties->>'name' as name"),
      db.raw("ST_AsGeoJSON(ST_Centroid(geom)) as centroid")
    )
    .where("id", countyId)
    .first()
    .then((county) => ({
      ...county,
      centroid: JSON.parse(county.centroid),
    }));

  const destinations = await db("counties")
    .select(
      "id",
      db.raw("properties->>'name' as name"),
      db.raw("ST_AsGeoJSON(ST_Centroid(geom)) as centroid")
    )
    .whereIn("id", to.split(","))
    .then((counties) =>
      counties.map((county) => ({
        ...county,
        centroid: JSON.parse(county.centroid),
      }))
    );

  const routes = {
    type: "FeatureCollection",
    features: destinations.map((d) => ({
      type: "Feature",
      properties: {
        originId: origin.id,
        destinationId: d.id,
      },
      geometry: {
        coordinates: [origin.centroid.coordinates, d.centroid.coordinates],
        type: "LineString",
      },
    })),
  };

  return res.json({ routes });
}

export default handler;
