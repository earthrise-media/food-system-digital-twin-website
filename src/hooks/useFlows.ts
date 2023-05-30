import { distance, point, lineString } from "@turf/turf";
import bezierSpline from "@turf/bezier-spline";
import {
  Link,
  LinkWithPaths,
  LinkWithTrips,
  Path,
  RawCountyWithFlows,
  RawFlows,
  Trip,
} from "@/types";
import { useAtomValue } from "jotai";
import { useMemo } from "react";
import { CATEGORY_COLORS } from "@/constants";
import { fetcher, hexToRgb } from "@/utils";
import { countiesAtom, flowTypeAtom } from "@/atoms";
import useSelectedCounty from "./useSelectedCounty";
import { useControls } from "leva";
import useSWR from "swr";

export default function useFlows(): Link[] {
  const counties = useAtomValue(countiesAtom);
  const selectedCounty = useSelectedCounty();
  const flowType = useAtomValue(flowTypeAtom);

  const {
    data: flowsData,
    error,
    isLoading,
  } = useSWR<RawFlows>(
    `/api/county/${selectedCounty?.properties.geoid}/inbound`,
    fetcher
  );

  return useMemo(() => {
    if (!selectedCounty || !counties || !flowsData) return [];
    const { inbound, county } = flowsData.flows;

    let selectedLinks: Link[] = inbound.map(
      ({ id, centroid, flows }: RawCountyWithFlows) => {
        const value = Object.values(flows).reduce(
          (partialSum, a) => partialSum + a,
          0
        );

        return {
          source:
            flowType === "consumer"
              ? centroid.coordinates
              : county.centroid.coordinates,
          target:
            flowType === "consumer"
              ? county.centroid.coordinates
              : centroid.coordinates,
          sourceId:
            flowType === "consumer" ? id.toString() : county.id.toString(),
          targetId:
            flowType === "consumer" ? county.id.toString() : id.toString(),
          value,
        };
      }
    );

    return selectedLinks;
  }, [counties, flowsData, selectedCounty, flowType]);
}

const getCurvedPaths = (
  link: Link,
  {
    numLinesPerLink = 10,
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

    const distances = [];
    for (
      let waypointIndex = 1;
      waypointIndex < allWaypoints.length;
      waypointIndex++
    ) {
      const waypoint = allWaypoints[waypointIndex];
      const prevWaypoint = allWaypoints[waypointIndex - 1];
      const dist = distance(point(prevWaypoint), point(waypoint));
      distances.push(dist);
    }

    const totalDistance = distances.reduce((a, b) => a + b, 0);

    let feature = lineString(allWaypoints);
    if (smooth) {
      feature = bezierSpline(feature, { resolution: 200 });
    }

    paths.push({
      coordinates: feature.geometry.coordinates,
      distances,
      totalDistance,
    });
  }
  return paths;
};

export function useFlowsWithCurvedPaths(links: Link[]): LinkWithPaths[] {
  const params = useControls("paths", {
    numLinesPerLink: 10,
    minWaypointsPer1000km: 4,
    maxWaypointsPer1000km: 8,
    minDeviationDegrees: 0,
    maxDeviationDegrees: 0.6,
    smooth: false,
  });
  return useMemo(() => {
    return links.map((l) => {
      const paths = getCurvedPaths(l, params);
      return { ...l, paths };
    });
  }, [links, params]);
}

const getPathTrips = (
  path: Path,
  {
    numParticles = 100,
    // numParticlesPer1000K = 100,
    fromTimestamp = 0,
    toTimeStamp = 100,
    intervalHumanize = 0.5, // Randomize particle start time (0: emitted at regular intervals, 1: emitted at "fully" random intervals)
    speedKps = 100, // Speed in km per second
    speedKpsHumanize = 0.5, // Randomize particles trajectory speed (0: stable duration, 1: can be 0 or 2x the speed)
  } = {}
): Trip[] => {
  const d = toTimeStamp - fromTimestamp;
  // const numParticles = (path.totalDistance / 1000) * numParticlesPer1000K;
  const interval = d / numParticles;

  const trips = [];

  for (let i = 0; i < numParticles; i++) {
    const humanizeSpeedKps =
      (Math.random() - 0.5) * 2 * speedKps * speedKpsHumanize;
    const humanizedSpeedKps = speedKps + humanizeSpeedKps;

    const baseDuration = path.totalDistance / humanizedSpeedKps;

    const humanizeInterval =
      (Math.random() - 0.5) * 2 * interval * intervalHumanize;

    const timestampStart = fromTimestamp + i * interval + humanizeInterval;

    const timestampEnd = timestampStart + baseDuration;

    const timestampDelta = timestampEnd - timestampStart;
    const waypoints = path.coordinates.map((c, i) => {
      const timestamp =
        timestampStart + (i / (path.coordinates.length - 1)) * timestampDelta;
      return { coordinates: c, timestamp: timestamp };
    });

    const hexColor =
      Object.values(CATEGORY_COLORS)[
        Math.floor(Math.random() * Object.values(CATEGORY_COLORS).length)
      ];
    const color = hexToRgb(hexColor);

    trips.push({
      waypoints,
      color: [...color, 255],
    });
  }
  return trips;
};

export function useFlowsWithTrips(links: LinkWithPaths[]): LinkWithTrips[] {
  const params = useControls("trips", {
    numParticles: 100,
    fromTimestamp: 0,
    toTimeStamp: 100,
    intervalHumanize: 0.5,
    speedKps: 100,
    speedKpsHumanize: 0.5,
  });
  return useMemo(() => {
    return links.map((l) => {
      const trips = l.paths
        .map((p) => {
          return getPathTrips(p, params);
        })
        .flat();

      return { ...l, trips };
    });
  }, [links, params]);
}