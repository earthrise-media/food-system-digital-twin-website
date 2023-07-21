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

  const byCropGroup = Object.fromEntries(
    byCropGroupRaw.map(
      ({ value, value_drought, value_heat_stress, ...rest }) => [
        rest.crop_category,
        {
          pct: getPct(value / total),
          pct_drought: getPct((value / total) * (value_drought / value)),
          pct_heat_stress: getPct(
            (value / total) * (value_heat_stress / value)
          ),
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

  return {
    total,
    formattedTotal: new Intl.NumberFormat("en-US", {
      maximumSignificantDigits: 3,
    }).format(total / 1000000),
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
}
