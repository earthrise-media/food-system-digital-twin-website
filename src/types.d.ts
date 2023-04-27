import { Position } from "geojson";

export type County = {
  geoid: string;
  name: string;
};

export type Category =
  | "vegetables"
  | "nuts"
  | "grain"
  | "fruit"
  | "roots-and-tubers";

export type Link = {
  source: Position;
  target: Position;
  value: number;
};

export type Path = {
  coordinates: Position[];
};

export type LinkWithPaths = Link & {
  paths: Path[];
};

export type Waypoint = {
  coordinates: Position;
  timestamp: number;
};

export type Trip = {
  waypoints: Waypoint[];
  color: number[];
};

export type LinkWithTrips = LinkWithPaths & {
  trips: Trip[];
};
