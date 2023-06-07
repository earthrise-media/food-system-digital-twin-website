export function groupFlowsByCounty(rawFlows) {
  return rawFlows.reduce((acc, curr) => {
    const existing = acc.find((f) => f.county_id === curr.county_id);
    if (existing) {
      existing.flows.push({
        crop_id: curr.crop_id,
        crop_name: curr.crop_name,
        crop_category: curr.crop_category,
        value: curr.value,
      });
    } else {
      acc.push({
        county_id: curr.county_id,
        county_name: curr.county_name,
        county_centroid: curr.county_centroid,
        flows: [
          {
            crop_id: curr.crop_id,
            crop_name: curr.crop_name,
            crop_category: curr.crop_category,
            value: curr.value,
          },
        ],
      });
    }
    return acc;
  }, []);
}