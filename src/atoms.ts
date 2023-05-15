import { FeatureCollection, Geometry } from "geojson";
import { atom } from "jotai";
import { atomWithHash } from "jotai-location";
import { County } from "./types";

export const countiesAtom = atom<FeatureCollection<Geometry, County> | null>(
  null
);
export const countyAtom = atomWithHash<string>("county", "47173");
export const searchAtom = atomWithHash<boolean>("search", false);
