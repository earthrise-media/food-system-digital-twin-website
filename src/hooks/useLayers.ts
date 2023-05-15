import { useMemo, useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { GeoJsonLayer } from "@deck.gl/layers/typed";
import { TripsLayer } from "@deck.gl/geo-layers/typed";
import { FeatureCollection, Geometry, Feature } from "geojson";
import { County, LinkWithTrips } from "@/types";
import { featureCollection } from "@turf/turf";
import useAnimationFrame from "@/hooks/useAnimationFrame";
import { countiesAtom, countyAtom } from "@/atoms";
import useSelectedCounty from "./useSelectedCounty";

export default function useLayers(
  targetCounties: Feature<Geometry, County>[],
  links: LinkWithTrips[]
) {
  const setSelectedCountId = useSetAtom(countyAtom);
  const counties = useAtomValue(countiesAtom);
  const selectedCounty = useSelectedCounty();

  const linksAsGeoJSON = useMemo(() => {
    if (!links.length) return null;
    const features = links
      .map((l) => {
        return l.paths.map(
          ({ coordinates }) =>
            ({
              type: "Feature",
              geometry: {
                type: "LineString",
                coordinates,
              },
            } as Feature)
        );
      })
      .flat();

    return featureCollection(features);
  }, [links]);

  const allTrips = useMemo(() => {
    if (!links.length) return [];
    return links.flatMap((l) => l.trips);
  }, [links]);

  const [currentTime, setCurrentTime] = useState(0);
  useAnimationFrame((e: any) => setCurrentTime(e.time));
  const animationSpeed = 1;
  const loopLength = 100;

  const currentFrame = useMemo(() => {
    return (currentTime * animationSpeed) % loopLength;
  }, [currentTime]);

  const layers = useMemo(() => {
    let layers: (GeoJsonLayer | TripsLayer)[] = [
      new GeoJsonLayer({
        id: "counties",
        data: counties as any,
        stroked: true,
        filled: true,
        getFillColor: [0, 0, 0, 0],
        // TODO use values from Glbal CSS
        getLineColor: [246, 243, 239, 255],
        lineWidthScale: 5000,
        lineWidthMinPixels: 1,
        getLineWidth: 1,
        onClick: ({ object }) => setSelectedCountId(object.properties.geoid),
        pickable: true,
      }),
    ];
    if (selectedCounty) {
      layers = [
        ...layers,
        new GeoJsonLayer({
          id: "counties-selected",
          data: [selectedCounty],
          stroked: true,
          filled: true,
          getFillColor: [0, 0, 0, 122],
          getLineColor: [0, 0, 0, 255],
          lineWidthScale: 5000,
          lineWidthMinPixels: 1,
          getLineWidth: 1,
        }),
        new GeoJsonLayer({
          id: "counties-targets",
          data: targetCounties,
          stroked: true,
          filled: true,
          getFillColor: [0, 0, 0, 50],
          getLineColor: [0, 0, 0, 150],
          lineWidthScale: 5000,
          lineWidthMinPixels: 0.5,
          getLineWidth: 0.1,
        }),
        new TripsLayer({
          id: "trips-layer",
          data: allTrips,
          getPath: (d) => d.waypoints.map((p: any) => p.coordinates),
          getTimestamps: (d) => d.waypoints.map((p: any) => p.timestamp),
          getColor: (d) => d.color,
          opacity: 0.8,
          widthMinPixels: 3,
          getWidth: (d) => {
            return 5000;
          },
          capRounded: true,
          jointRounded: true,
          fadeTrail: true,
          trailLength: 0.2,
          currentTime: currentFrame,
        }),
      ];
    }
    if (linksAsGeoJSON) {
      layers.push(
        new GeoJsonLayer({
          id: "lines",
          data: linksAsGeoJSON as any,
          stroked: true,
          lineWidthUnits: "pixels",
          getLineWidth: 0.5,
          getLineColor: [255, 0, 255, 0],
          // getLineColor: (d: any) => d.properties.color,
          // getLineWidth: (d: any) => d.properties.width,
        })
      );
    }
    return layers;
  }, [
    counties,
    selectedCounty,
    targetCounties,
    linksAsGeoJSON,
    allTrips,
    currentFrame,
    setSelectedCountId,
  ]);
  return layers;
}
