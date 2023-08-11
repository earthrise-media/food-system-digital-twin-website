import { FeatureCollection, Geometry } from "geojson";
import { atom } from "jotai";
import { atomWithHash } from "jotai-location";
import {
  County,
  FlowType,
  Category,
  AdverseConditions,
  MapViewport,
} from "./types";
import { INITIAL_VIEW_STATE } from "./constants";
import { deserialize } from "v8";
import { toDecimalPlaces } from "./utils";

export const countiesAtom = atom<FeatureCollection<Geometry, County> | null>(
  null
);
export const countyAtom = atomWithHash<string>("county", "21137");
export const countyHighlightedAtom = atom<string | null>(null);
export const searchAtom = atomWithHash<boolean>("search", false);
export const flowTypeAtom = atomWithHash<FlowType>("flowType", "consumer");
export const foodGroupAtom = atomWithHash<Category | null>("foodGroup", null);
export const roadsAtom = atomWithHash<boolean>("roads", false);
export const adverseConditionsAtom = atomWithHash<AdverseConditions | null>(
  "adverseConditions",
  null
);
export const allLinkedCountiesAtom = atomWithHash<boolean>(
  "allLinkedCounties",
  false
);
export const viewportAtom = atomWithHash<MapViewport>(
  "viewport",
  INITIAL_VIEW_STATE,
  {
    serialize: (value) => {
      return `${toDecimalPlaces(value.longitude)}~${toDecimalPlaces(
        value.latitude
      )}~${toDecimalPlaces(value.zoom)}`;
    },
    deserialize: (value) => {
      const [longitude, latitude, zoom] = value.split("~").map(parseFloat);
      return {
        longitude,
        latitude,
        zoom,
      };
    },
  }
);

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
