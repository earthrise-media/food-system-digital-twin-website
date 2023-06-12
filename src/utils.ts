import { CATEGORIES } from "./constants";
import { Category, RawCountyFlows } from "./types";

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
  const total = byCropGroupRaw.reduce((acc, curr) => acc + curr.value, 0);

  const byCropGroup = Object.fromEntries(
    byCropGroupRaw.map(({ value, ...rest }) => [
      rest.crop_category,
      {
        value: Math.round((value / total) * 1000) / 10,
        ...rest,
      },
    ])
  );

  const byCropGroupCumulative = CATEGORIES.reduce((acc, curr) => {
    const prev = acc[acc.length - 1];
    const value = (byCropGroup[curr]?.value || 0) / 100 + (prev ? prev : 0);
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
