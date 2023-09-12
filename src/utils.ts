import { Position } from "geojson";
import { CATEGORIES } from "./constants";
import { Category, RawCountyFlows } from "./types";
import { distance, point } from "turf";

export const hexToRgb = (hex: string): number[] => {
  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);

  return [r, g, b];
};

export const fetcher = (
  ...args: [RequestInfo | URL, RequestInit | undefined]
) => fetch(...args).then((res) => res.json());

export const getStats = (
  byCropGroupRaw: RawCountyFlows[],
  byCropRaw: RawCountyFlows[]
) => {
  const getPct = (v: number) => Math.round(v * 1000) / 10;
  const total = byCropGroupRaw.reduce((acc, curr) => acc + curr.value, 0);
  const total_drought = byCropGroupRaw.reduce((acc, curr) => acc + curr.value_drought, 0);
  const total_heat_stress = byCropGroupRaw.reduce((acc, curr) => acc + curr.value_heat_stress, 0);
  const total_drought_var = getPct((total_drought - total) / total);
  const total_heat_stress_var = getPct((total_heat_stress - total) / total);
  
  const byCropGroup = Object.fromEntries(
    byCropGroupRaw.map(
      ({ value, value_drought, value_heat_stress, ...rest }) => [
        rest.crop_category,
        {
          value,
          value_drought,
          value_heat_stress,
          pct: getPct(value / total),
          pct_drought: getPct((value / total) * (value_drought / value)),
          pct_heat_stress: getPct(
            (value / total) * (value_heat_stress / value)
          ),
          var_drought: getPct((value_drought - value) / value),
          var_heat_stress: getPct((value_heat_stress - value) / value),
        },
      ]
    )
  );

  const byCropGroupCumulative = CATEGORIES.reduce((acc, curr) => {
    const prev = acc[acc.length - 1];
    const value = (byCropGroup[curr]?.pct || 0) / 100 + (prev ? prev : 0);
    return [...acc, value];
  }, [] as number[]);

  const byCropDict = byCropRaw.reduce((acc, curr) => {
    const category = curr.crop_category;
    if (!acc[category]) {
      acc[category] = {};
    }
    if (!acc[category][curr.crop_name!]) {
      acc[category][curr.crop_name!] = 0;
    }
    acc[category][curr.crop_name!] +=
      Math.round((curr.value / total) * 1000) / 10;
    return acc;
  }, {} as Record<Category, Record<string, number>>);

  const byCrop = Object.fromEntries(
    Object.entries(byCropDict).map(([category, crops]) => {
      const sortedCrops = Object.entries(crops).sort((a, b) => b[1] - a[1]);
      return [category, sortedCrops];
    })
  );

  const unit = total < 1000000000 ? "M" : "B";

  return {
    total,
    total_drought_var,
    total_heat_stress_var,
    formattedTotal: {
      unit,
      value: new Intl.NumberFormat("en-US", {
        maximumSignificantDigits: 3,
      }).format(total / (unit === "M" ? 1000000 : 1000000000)),
    },
    byCropGroup,
    byCropGroupCumulative,
    byCrop,
  };
};

export type Stats = ReturnType<typeof getStats>;

export const getDistances = (coordinates: Position[]) => {
  const distances = [];
  for (
    let waypointIndex = 1;
    waypointIndex < coordinates.length;
    waypointIndex++
  ) {
    const waypoint = coordinates[waypointIndex];
    const prevWaypoint = coordinates[waypointIndex - 1];
    const dist = distance(point(prevWaypoint), point(waypoint));
    distances.push(dist);
  }

  const totalDistance = distances.reduce((a, b) => a + b, 0);
  return {
    distances,
    totalDistance,
  };
};

export const toDecimalPlaces = (value: number, decimalPlaces: number = 3) => {
  return Math.round(value * 10 ** decimalPlaces) / 10 ** decimalPlaces;
};
