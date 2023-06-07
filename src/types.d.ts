import { Point } from "geojson";
import { Geometry } from "geojson";
import { Position } from "geojson";

export type County = {
  geoid: string;
  name: string;
  stusps: string;
};

export type Category = "vegetables" | "nuts" | "grain" | "fruits" | "tubbers";

export type RawFlow = { 
  county_id: string;
  county_name: string;
  county_centroid: Geometry<Point>;
  crop_id: number;
  crop_name: string;
  value: number;
};

export type RawFlows = {
  inbound: RawFlow[];
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
