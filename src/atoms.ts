import { FeatureCollection, Geometry } from "geojson";
import { atom } from "jotai";
import { atomWithHash } from "jotai-location";
import { County, FlowType, Category } from "./types";

export const countiesAtom = atom<FeatureCollection<Geometry, County> | null>(
  null
);
export const countyAtom = atomWithHash<string>("county", "47173");
export const countyHighlightedAtom = atom<string | null>(null);
export const searchAtom = atomWithHash<boolean>("search", false);
export const flowTypeAtom = atomWithHash<FlowType>("flowType", "producer");
export const foodGroupAtom = atomWithHash<Category | null>("foodGroup", null);

export const selectedCountyAtom = atom((get) => {
  const countyId = get(countyAtom);
  const counties = get(countiesAtom);
  if (!countyId || !counties) return;
  return counties.features.find(
    (county) => county.properties.geoid === countyId
  );
});

export const highlightedCountyAtom = atom((get) => {
  const countyId = get(countyHighlightedAtom);
  const counties = get(countiesAtom);
  if (!countyId || !counties) return;
  return counties.features.find(
    (county) => county.properties.geoid === countyId
  );
});
