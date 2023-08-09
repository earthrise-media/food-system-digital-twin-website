import { distance, point, lineString, circle, centroid } from "@turf/turf";
import bezierSpline from "@turf/bezier-spline";
import polyline from "google-polyline";
import { LineString } from "geojson";
import {
  Flow,
  FlowWithPaths,
  FlowWithTrips,
  Path,
  Trip,
  Waypoint,
} from "@/types";
import { useAtomValue } from "jotai";
import { useMemo } from "react";
import { CATEGORIES, CATEGORIES_PROPS, TOP_COUNTIES_NUMBER } from "@/constants";
import { getDistances, getStats, hexToRgb } from "@/utils";
import {
  allLinkedCountiesAtom,
  countiesAtom,
  flowTypeAtom,
  roadsAtom,
  selectedCountyAtom,
} from "@/atoms";
import { useControls } from "leva";
import { along } from "turf";
import { useLinkedFlows } from "./useLinkedCounties";

export default function useFlows(): Flow[] {
  const counties = useAtomValue(countiesAtom);
  const selectedCounty = useAtomValue(selectedCountyAtom);
  const flowType = useAtomValue(flowTypeAtom);
  const allLinkedCounties = useAtomValue(allLinkedCountiesAtom);

  const { flows, isLoading } = useLinkedFlows();

  const { maxTargetCounties } = useControls("filtering", {
    maxTargetCounties: 100,
  });

  return useMemo(() => {
    if (!selectedCounty || !counties || !flows || isLoading) return [];
    const { geoid: selectedId } = selectedCounty.properties;
    const selectedCentroid = centroid(selectedCounty);

    let selectedLinks: Flow[] = flows
      .slice(
        0,
        Math.min(
          maxTargetCounties,
          allLinkedCounties ? Number.POSITIVE_INFINITY : TOP_COUNTIES_NUMBER
        )
      )
      .map(
        ({
          county_id,
          county_centroid,
          route_geometry,
          route_direction,
          total,
          byCropGroupCumulative,
        }) => {
          // const VALUES_RATIOS_BY_FOOD_GROUP = [.1,.2,.3,.35,1]
          // const VALUES_RATIOS_BY_FOOD_GROUP = [.2,.4,.6,.8,1]
          // const VALUES_RATIOS_BY_FOOD_GROUP = [0.5, 0.55, 0.6, 0.8, 1];
          const value = Math.max(1, total / 200000000);

          const source =
            flowType === "consumer"
              ? county_centroid.coordinates
              : selectedCentroid.geometry.coordinates;
          const target =
            flowType === "consumer"
              ? selectedCentroid.geometry.coordinates
              : county_centroid.coordinates;

          const sourceId =
            flowType === "consumer" ? county_id : selectedId.toString();
          const targetId =
            flowType === "consumer" ? selectedId.toString() : county_id;

          const routeGeometry = route_geometry
            ? ({
                type: "LineString",
                coordinates: polyline
                  .decode(route_geometry)
                  .map(([lng, lat]) => [lat, lng]),
              } as LineString)
            : undefined;

          if (
            (flowType === "consumer" && route_direction === "backward") ||
            (flowType === "producer" && route_direction === "forward")
          ) {
            routeGeometry?.coordinates.reverse();
          }

          return {
            source,
            target,
            sourceId,
            targetId,
            routeGeometry,
            value,
            valuesRatiosByFoodGroup: byCropGroupCumulative,
          };
        }
      );

    return selectedLinks;
  }, [
    counties,
    flows,
    selectedCounty,
    flowType,
    maxTargetCounties,
    isLoading,
    allLinkedCounties,
  ]);
}

const getCurvedPaths = (
  link: Flow,
  {
    linesPerLinkMultiplicator = 1,
    maxLinesPerLink = 30,
    minWaypointsPer1000km = 4,
    maxWaypointsPer1000km = 8,
    minDeviationDegrees = 0,
    maxDeviationDegrees = 0.6,
    smooth = false,
  } = {}
): Path[] => {
  const [startX, startY] = link.source;
  const [endX, endY] = link.target;
  const dist = distance(point(link.source), point(link.target));
  const minWaypoints = Math.round((dist / 1000) * minWaypointsPer1000km);
  const maxWaypoints = Math.round((dist / 1000) * maxWaypointsPer1000km);

  const numLinesPerLink = Math.min(
    Math.round(link.value * linesPerLinkMultiplicator),
    maxLinesPerLink
  );

  const paths = [];
  for (let lineIndex = 0; lineIndex < numLinesPerLink; lineIndex++) {
    const numWaypoints =
      Math.floor(Math.random() * (1 + maxWaypoints - minWaypoints)) +
      minWaypoints;

    const waypoints = [];
    for (let waypointIndex = 0; waypointIndex < numWaypoints; waypointIndex++) {
      const waypointRatio = (1 / (numWaypoints + 1)) * (waypointIndex + 1);

      // alternativaly deviate left and right
      const deviationSign = waypointIndex % 2 === 0 ? 1 : -1;
      let deviation =
        deviationSign *
          Math.random() *
          (maxDeviationDegrees - minDeviationDegrees) +
        minDeviationDegrees;
      const midpoint = [
        startX + (endX - startX) * waypointRatio,
        startY + (endY - startY) * waypointRatio,
      ];

      const [midX, midY] = midpoint;
      const angle = Math.atan2(endY - startY, endX - startX);
      const waypoint = [
        deviation * Math.cos(angle) + midX,
        -deviation * Math.sin(angle) + midY,
      ];

      waypoints.push(waypoint);
    }

    const allWaypoints = [link.source, ...waypoints, link.target];

    let feature = lineString(allWaypoints);
    if (smooth) {
      feature = bezierSpline(feature, { resolution: 500 });
    }

    const allWaypointsCoords = feature.geometry.coordinates;
    const { distances, totalDistance } = getDistances(allWaypointsCoords);

    paths.push({
      coordinates: feature.geometry.coordinates,
      distances,
      totalDistance,
    });
  }
  return paths;
};

export function useFlowsWithCurvedPaths(flows: Flow[]): FlowWithPaths[] {
  const params = useControls("paths", {
    linesPerLinkMultiplicator: 2,
    maxLinesPerLink: 10,
    minWaypointsPer1000km: 4,
    maxWaypointsPer1000km: 8,
    minDeviationDegrees: 0,
    maxDeviationDegrees: 0.6,
    smooth: false,
  });
  return useMemo(() => {
    return flows.map((l) => {
      const isSelf = l.sourceId === l.targetId;
      const paths = isSelf ? getSelfPath(l) : getCurvedPaths(l, params);
      return { ...l, paths };
    });
  }, [flows, params]);
}

const getSelfPath = (link: Flow): Path[] => {
  const RADIUS = 10;
  const lineAlong = lineString([
    link.source,
    [link.source[0] + 10, link.source[1] - 10],
  ]);
  const center = along(lineAlong, RADIUS, "kilometers");
  // const center = lineOffset(point(link.source), RADIUS / 2, { units: "kilometers" })
  const circleFeature = circle(center, RADIUS, 20, "kilometers");
  const circleCoords = circleFeature.geometry.coordinates[0];
  const { distances, totalDistance } = getDistances(circleCoords);
  return [
    {
      coordinates: circleCoords,
      distances,
      totalDistance,
    },
  ];
};

const getRoadPaths = (link: Flow): Path[] => {
  const { distances, totalDistance } = getDistances(
    link.routeGeometry?.coordinates || []
  );
  return [
    {
      coordinates: link.routeGeometry?.coordinates || [],
      distances,
      totalDistance,
    },
  ];
};

export function useFlowsWithRoadPaths(flows: Flow[]): FlowWithPaths[] {
  return useMemo(() => {
    return flows.map((l, i) => {
      const isSelf = l.sourceId === l.targetId;
      const paths = isSelf ? getSelfPath(l) : getRoadPaths(l);
      return { ...l, paths };
    });
  }, [flows]);
}

const getPathTrips = (
  path: Path,
  flow: Flow,
  {
    numParticlesMultiplicator = 1,
    // numParticlesPer1000K = 100,
    fromTimestamp = 0,
    toTimeStamp = 100,
    intervalHumanize = 0.5, // Randomize particle start time (0: emitted at regular intervals, 1: emitted at "fully" random intervals)
    speedKps = 100, // Speed in km per second
    speedKpsHumanize = 0.5, // Randomize particles trajectory speed (0: stable duration, 1: can be 0 or 2x the speed)
    maxParticles = 500,
  } = {},
  zoomMultiplier: number
): Trip[] => {
  const numParticles = Math.min(
    flow.value * numParticlesMultiplicator,
    maxParticles
  );

  const speedZoomMultiplier = ((3 - zoomMultiplier) + 2) / 3
  const baseSpeedKps = speedKps * speedZoomMultiplier

  const d = toTimeStamp - fromTimestamp;
  // const numParticles = (path.totalDistance / 1000) * numParticlesPer1000K;
  const interval = d / numParticles;

  const trips = [];

  for (let i = 0; i < numParticles; i++) {
    const humanizeSpeedKps =
      (Math.random() - 0.5) * 2 * baseSpeedKps * speedKpsHumanize;
    const humanizedSpeedKps = baseSpeedKps + humanizeSpeedKps;

    const baseDuration = path.totalDistance / humanizedSpeedKps;

    const humanizeInterval =
      (Math.random() - 0.5) * 2 * interval * intervalHumanize;

    const timestampStart = fromTimestamp + i * interval + humanizeInterval;

    const timestampEnd = timestampStart + baseDuration;

    const timestampDelta = timestampEnd - timestampStart;
    const waypointsAccumulator = path.coordinates.reduce(
      (accumulator, currentCoords, currentIndex) => {
        const accDistance = accumulator.accDistance;
        const accDistanceRatio = accDistance / path.totalDistance;
        const timestamp = timestampStart + accDistanceRatio * timestampDelta;

        return {
          accDistance: accDistance + path.distances[currentIndex],
          waypoints: [
            ...accumulator.waypoints,
            { coordinates: currentCoords, timestamp: timestamp },
          ],
        };
      },
      { waypoints: [] as Waypoint[], accDistance: 0 }
    );

    if (!flow.valuesRatiosByFoodGroup) continue;
    const randomCategoryRatio = Math.random();
    const categoryIndex =
      flow.valuesRatiosByFoodGroup.reduce((acc, ratio, i) => {
        if (acc !== null) return acc;
        if (randomCategoryRatio < ratio) return i;
        return acc;
      }, null as number | null) || 0;
    const category = CATEGORIES[categoryIndex];
    const categoryColor = CATEGORIES_PROPS[category].color;
    const color = hexToRgb(categoryColor);
    // console.log(waypoints)
    trips.push({
      waypoints: waypointsAccumulator.waypoints,
      color: [...color, 255],
      foodGroup: category,
    });
  }
  return trips;
};

export function useFlowsWithTrips(
  flowsWithCurvedPaths: FlowWithPaths[],
  flowsWithRoadPaths: FlowWithPaths[],
  zoomMultiplier: number
): FlowWithTrips[] {
  const params = useControls("trips", {
    numParticlesCurvedPathsMultiplicator: 8,
    numParticlesRoadsMultiplicator: 100,
    fromTimestamp: 0,
    toTimeStamp: 100,
    intervalHumanize: 1,
    speedKps: 100,
    speedKpsHumanize: 0.2,
    maxParticles: 100,
  });

  const roads = useAtomValue(roadsAtom);

  return useMemo(() => {
    const flowsWithPaths = roads ? flowsWithRoadPaths : flowsWithCurvedPaths;
    return flowsWithPaths.map((l) => {
      const trips = l.paths
        .map((p) => {
          return getPathTrips(p, l, {
            ...params,
            numParticlesMultiplicator: roads
              ? params.numParticlesRoadsMultiplicator
              : params.numParticlesCurvedPathsMultiplicator,
          }, zoomMultiplier);
        })
        .flat();

      return { ...l, trips };
    });
  }, [flowsWithCurvedPaths, flowsWithRoadPaths, params, roads, zoomMultiplier]);
}
