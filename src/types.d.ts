import { Feature, LineString, Point } from "geojson";
import { Geometry } from "geojson";
import { Position } from "geojson";

export type County = {
  geoid: string;
  name: string;
  stusps: string;
};

export type Category = "Vegetables" | "Nuts" | "Grain" | "Fruits" | "Potatoes";

export type RawCountyFlows = {
  crop_id?: number;
  crop_name?: string;
  crop_category: Category,
  value: number,
}
  
export type RawFlowStats = {
  byCrop: RawCountyFlows[];
  byCropGroup: RawCountyFlows[];
};

export type RawCountyWithFlows = { 
  county_id: string;
  county_name: string;
  county_centroid: Geometry<Point>;
  route_geometry?: Feature<LineString>;
  flowsByCrop: RawCountyFlows[];
  flowsByCropGroup: RawCountyFlows[];
};

export type RawFlowsInbound = {
  inbound: RawCountyWithFlows[];
  stats: RawFlowStats;
};

export type RawFlowsOutbound = {
  outbound: RawCountyWithFlows[];
  stats: RawFlowStats;
};

export type Flow = {
  source: Position;
  target: Position;
  sourceId: string;
  targetId: string;
  value: number;
  valuesRatiosByFoodGroup: number[];
  routeGeometry?: Feature<LineString>;
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
