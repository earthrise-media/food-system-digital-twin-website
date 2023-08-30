import { FeatureCollection, Geometry } from "geojson";
import { atom } from "jotai";
import { atomWithHash } from "jotai-location";
import {
  County,
  FlowType,
  Category,
  AdverseConditions,
  MapViewport,
  MapViewportProp,
} from "./types";
import { INITIAL_VIEW_STATE } from "./constants";
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
    serialize: (viewport) => {
      return (
        [
          "longitude",
          "latitude",
          "zoom",
          "pitch",
          "bearing",
        ] as MapViewportProp[]
      )
        .map((key) => toDecimalPlaces(viewport[key]))
        .join("~");
    },
    deserialize: (viewportStr) => {
      const [longitude, latitude, zoom, pitch, bearing] = viewportStr
        .split("~")
        .map(parseFloat);
      return {
        longitude,
        latitude,
        zoom,
        pitch,
        bearing,
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
