import { Point } from "geojson";
import { Geometry } from "geojson";
import { Position } from "geojson";

export type County = {
  geoid: string;
  name: string;
  stusps: string;
};

export type Category = "vegetables" | "nuts" | "grain" | "fruits" | "tubbers";

export type RawCounty = {
  id: number;
  name: string;
  centroid: Geometry<Point>;
};

export type RawCountyWithFlows = RawCounty & {
  flows: Record<Category, number>;
};

export type RawFlows = {
  flows: {
    county: RawCounty;
    inbound: RawCountyWithFlows[];
  };
};

export type Link = {
  source: Position;
  target: Position;
  targetId: string;
  value: number;
};

export type Path = {
  coordinates: Position[];
  distances: number[];
  totalDistance: number;
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

export type FlowType = "producer" | "consumer";
