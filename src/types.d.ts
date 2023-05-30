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

export type Flow = {
  source: Position;
  target: Position;
  sourceId: string;
  targetId: string;
  value: number;
  valuesRatiosByFoodGroup: number[];
};

export type Path = {
  coordinates: Position[];
  distances: number[];
  totalDistance: number;
};

export type FlowWithPaths = Flow & {
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

export type FlowWithTrips = FlowWithPaths & {
  trips: Trip[];
};

export type FlowType = "producer" | "consumer";
