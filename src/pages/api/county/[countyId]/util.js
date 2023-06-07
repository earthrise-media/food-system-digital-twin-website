export function groupFlowsByCounty(rawFlows) {
  const flowsByCounty = rawFlows.reduce((acc, curr) => {
    const existing = acc.find((f) => f.county_id === curr.county_id);
    if (existing) {
      existing.flowsByCrop.push({
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
        flowsByCrop: [
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

  flowsByCounty.forEach((f) => {
    f.flowsByCropGroup = f.flowsByCrop.reduce((acc, curr) => {
      const existing = acc.find((c) => c.crop_category === curr.crop_category);
      if (existing) {
        existing.value += curr.value;
      } else {
        acc.push({
          crop_category: curr.crop_category,
          value: curr.value,
        });
      }
      return acc;
    }, []);
  });

  return flowsByCounty;
}