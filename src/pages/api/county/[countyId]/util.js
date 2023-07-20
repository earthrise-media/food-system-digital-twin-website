import db from "../../../../helpers/db";

export function groupFlowsByCounty(rawFlows) {
  const flowsByCounty = rawFlows.reduce((acc, curr) => {
    const existing = acc.find((f) => f.county_id === curr.county_id);
    const {
      county_id,
      county_name,
      county_centroid,
      crop_id,
      crop_name,
      crop_category,
      value,
      value_drought,
      value_heat_stress,
    } = curr;

    if (existing) {
      existing.flowsByCrop.push({
        crop_id,
        crop_name,
        crop_category,
        value,
        value_drought,
        value_heat_stress
      });
    } else {
      acc.push({
        county_id,
        county_name,
        county_centroid,
        flowsByCrop: [
          {
            crop_id,
            crop_name,
            crop_category,
            value,
            value_drought,
            value_heat_stress
          },
        ],
      });
    }
    return acc;
  }, []);

  flowsByCounty.forEach((f) => {
    f.flowsByCropGroup = f.flowsByCrop.reduce((acc, curr) => {
      const existing = acc.find((c) => c.crop_category === curr.crop_category);
      if (existing) {
        existing.value += curr.value;
        existing.value_drought += curr.value_drought;
        existing.value_heat_stress += curr.value_heat_stress;
      } else {
        acc.push({
          crop_category: curr.crop_category,
          value: curr.value,
          value_drought: curr.value_drought,
          value_heat_stress: curr.value_heat_stress,
        });
      }
      return acc;
    }, []);
  });

  return flowsByCounty;
}

export function getStats(flows) {
  const stats = {
    byCrop: {},
    byCropGroup: {},
  };

  stats.byCrop = flows.reduce((acc, curr) => {
    const existing = acc.find((f) => f.crop_id === curr.crop_id);
    if (existing) {
      existing.value += curr.value;
      existing.value_drought += curr.value_drought;
      existing.value_heat_stress += curr.value_heat_stress;
    } else {
      acc.push({
        crop_id: curr.crop_id,
        crop_name: curr.crop_name,
        crop_category: curr.crop_category,
        value: curr.value,
        value_drought: curr.value_drought,
        value_heat_stress: curr.value_heat_stress,
      });
    }
    return acc;
  }, []);

  stats.byCropGroup = stats.byCrop.reduce((acc, curr) => {
    const existing = acc.find((c) => c.crop_category === curr.crop_category);
    if (existing) {
      existing.value += curr.value;
      existing.value_drought += curr.value_drought;
      existing.value_heat_stress += curr.value_heat_stress;
    } else {
      acc.push({
        crop_category: curr.crop_category,
        value: curr.value,
        value_drought: curr.value_drought,
        value_heat_stress: curr.value_heat_stress,
      });
    }
    return acc;
  }, []);

  return stats;
}

/**
 *
 * Get polyline geometry for routes between a set of origins and a destination,
 * assuming routes are symmetric (i.e. route for A to B is equal to B to A).
 *
 * @param {string} originsIds
 * @param {Array(string)} countyId
 * @returns
 */
export async function getSymmetricRoutes(countyId, originsIds) {
  const routesForward = await db("routes")
    .select("routes.origin_id", "routes.destination_id", "polyline")
    .where("routes.origin_id", "in", originsIds)
    .andWhere("routes.destination_id", countyId);

  const routesBackwards = await db("routes")
    .select(
      "routes.origin_id as destination_id",
      "routes.destination_id as origin_id",
      "polyline"
    )
    .where("routes.destination_id", "in", originsIds)
    .andWhere("routes.origin_id", countyId);

  const routes = routesForward.concat(routesBackwards);

  return routes;
}
