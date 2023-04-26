import { FeatureCollection, Geometry, Feature } from "geojson";
import { centroid } from "@turf/turf";
import { County, Link } from "@/types";
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
      (l) => l.Supply.toString() === (selectedCounty)?.properties.geoid
    );

    if (!selectedCountyLinks) return [];

    let targetsGeoIds = Object.entries(selectedCountyLinks).filter(
      ([k, v]) => v > 0
    );

    let selectedLinks: Link[] = targetsGeoIds.flatMap(([k, v]) => {
      const target = counties.features.find(
        (c) => c.properties.geoid === k
      );
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
