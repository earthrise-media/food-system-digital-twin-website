import { Position } from "geojson";

export type County = {
  geoid: string;
  name: string;
  stusps: string
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
  sourceId: string;
  targetId: string;
  value: number;
};

export type Path = {
  coordinates: Position[];
  distances: number[];
  totalDistance: number
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
  sourceId?: string;
  targetId?: string;
};

export type LinkWithTrips = LinkWithPaths & {
  trips: Trip[];
};

export type FlowType = 'producer' | 'consumer';