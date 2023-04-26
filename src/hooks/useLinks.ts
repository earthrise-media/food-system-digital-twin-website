import { FeatureCollection, Geometry, Feature, Position } from "geojson";
import {
  centroid,
  distance,
  point,
  lineString,
  bezierSpline,
} from "@turf/turf";
import { County, Link, LinkWithPaths } from "@/types";
import { useMemo } from "react";

export default function useLinks(
  selectedCounty: Feature<Geometry, County> | null,
  counties: FeatureCollection<Geometry, County>,
  // TODO This will need to be fetched from the APIs depending on the target or source county
  links: Record<string, number>[]
): Link[] {
  return useMemo(() => {
    if (!selectedCounty) return [];
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
          value: v,
        },
      ];
    });

    // TODO Use top 10 instead of random ones
    let sample: Link[] = [];
    for (let index = 0; index < 10; index++) {
      const randomIndex = Math.floor(Math.random() * selectedLinks.length);
      sample = [...sample, selectedLinks[randomIndex]];
    }
    return sample;
  }, [counties, links, selectedCounty]);
}

const getCurvedPaths = (
  link: Link,
  {
    numLines = 10,
    minWaypointsPer1000km = 0,
    maxWaypointsPer1000km = 8,
    minDeviationDegrees = 0,
    maxDeviationDegrees = 0.5,
    smooth = true,
  } = {}
): Position[][] => {
  const [startX, startY] = link.source;
  const [endX, endY] = link.target;
  const dist = distance(point(link.source), point(link.target));
  const minWaypoints = Math.round((dist / 1000) * minWaypointsPer1000km);
  const maxWaypoints = Math.round((dist / 1000) * maxWaypointsPer1000km);

  const paths = [];
  for (let lineIndex = 0; lineIndex < numLines; lineIndex++) {
    const numWaypoints =
      Math.floor(Math.random() * (1 + maxWaypoints - minWaypoints)) +
      minWaypoints;
    const waypoints = [];
    for (let waypointIndex = 0; waypointIndex < numWaypoints; waypointIndex++) {
      const waypointRatio = (1 / (numWaypoints + 1)) * (waypointIndex + 1);
      const deviationSign = waypointIndex % 2 === 0 ? 1 : -1;
      // alternativaly deviate left and right
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
    let feature = lineString([link.source, ...waypoints, link.target]);

    if (smooth) {
      feature = bezierSpline(feature);
    }
    // feature.properties = {
    //   color: lineIndex === 0 ? arc.color : [...arc.color, 100],
    //   width: lineIndex === 0 ? 2 : .5
    // }
    paths.push(feature.geometry.coordinates);
  }
  return paths;
};

export function useLinksWithCurvedPaths(links: Link[]): LinkWithPaths[] {
  return useMemo(() => {
    return links.map((l) => {
      const paths = getCurvedPaths(l);
      return { ...l, paths };
    });
  }, [links]);
}
