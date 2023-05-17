import { FeatureCollection, Geometry, Feature, Position } from "geojson";
import { centroid, distance, point, lineString } from "@turf/turf";
import bezierSpline from "@turf/bezier-spline";
import {
  County,
  Link,
  LinkWithPaths,
  LinkWithTrips,
  Path,
  Trip,
} from "@/types";
import { useAtomValue } from "jotai";
import { useMemo } from "react";
import { CATEGORY_COLORS } from "@/constants";
import { hexToRgb } from "@/utils";
import { countiesAtom } from "@/atoms";
import useSelectedCounty from "./useSelectedCounty";
import { useControls } from "leva";

export default function useLinks(
  // TODO This will need to be fetched from the APIs depending on the target or source county
  links: Record<string, number>[]
): Link[] {
  const { numFlows } = useControls("flows", { numFlows: 10 });
  const counties = useAtomValue(countiesAtom);
  const selectedCounty = useSelectedCounty();
  return useMemo(() => {
    if (!selectedCounty || !counties) return [];
    const selectedCountyLinks = links.find(
      (l) => l.Supply?.toString() === selectedCounty?.properties.geoid
    );

    if (!selectedCountyLinks) return [];

    let targetsGeoIds = Object.entries(selectedCountyLinks).filter(
      ([k, v]) => v > 0
    );

    let selectedLinks: Link[] = targetsGeoIds.flatMap(([k, v]) => {
      const target = counties.features.find((c) => c.properties.geoid === k);
      if (!target || !target.geometry) return [];

      return [
        {
          // TODO precompute centroid
          source: centroid(selectedCounty as any).geometry.coordinates,
          target: centroid(target as any).geometry.coordinates,
          sourceId: selectedCounty.properties.geoid,
          targetId: target.properties.geoid,
          value: v,
        },
      ];
    });

    // TODO Use top 10 instead of random ones
    let sample: Link[] = [];
    for (let index = 0; index < numFlows; index++) {
      const randomIndex = Math.floor(Math.random() * selectedLinks.length);
      sample = [...sample, selectedLinks[randomIndex]];
    }
    return sample;
  }, [counties, links, selectedCounty, numFlows]);
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

export function useLinksWithCurvedPaths(links: Link[]): LinkWithPaths[] {
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

export function useLinksWithTrips(links: LinkWithPaths[]): LinkWithTrips[] {
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
