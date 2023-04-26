import { Position } from "geojson";

export type County = {
  geoid: string;
  name: string;
};

export type Link = {
  source: Position;
  target: Position;
  value: number;
}