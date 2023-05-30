import { FeatureCollection, Geometry } from "geojson";
import { atom } from "jotai";
import { atomWithHash } from "jotai-location";
import { County, FlowType } from "./types";

export const countiesAtom = atom<FeatureCollection<Geometry, County> | null>(
  null
);
export const countyAtom = atomWithHash<string>("county", "47173");
export const countyHighlightedAtom = atom<string | null>(null);
export const searchAtom = atomWithHash<boolean>("search", false);
export const flowTypeAtom = atomWithHash<FlowType>("flowType", "producer");
