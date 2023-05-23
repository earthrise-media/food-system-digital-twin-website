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
import { useControls } from "leva";

const BASE_LINE_LAYERS_OPTIONS = {
  stroked: true,
  filled: true,
  lineCapRounded: true,
  lineJointRounded: true,
  lineWidthScale: 5000,
  getLineWidth: 1,
}

export default function useLayers(
  targetCounties: Feature<Geometry, County>[],
  links: LinkWithTrips[],
  showAnimatedLayers = true
) {
  const setSelectedCountId = useSetAtom(countyAtom);
  const counties = useAtomValue(countiesAtom);
  const selectedCounty = useSelectedCounty();
  const { linesColor, animationSpeed } = useControls("layers", {
    linesColor: { r: 200, b: 125, g: 106, a: 0.2 },
    animationSpeed: 1,
  });

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

  const loopLength = 100;

  const currentFrame = useMemo(() => {
    return (currentTime * animationSpeed) % loopLength;
  }, [currentTime, animationSpeed]);

  const layers = useMemo(() => {
    let layers: (GeoJsonLayer | TripsLayer)[] = [
      new GeoJsonLayer({
        id: "counties",
        data: counties as any,
        ...BASE_LINE_LAYERS_OPTIONS,
        getFillColor: [0, 0, 0, 0],
        // TODO use values from Glbal CSS
        getLineColor: [246, 243, 239, 255],
        lineWidthMinPixels: 1,
        lineWidthMaxPixels: 5,
        onClick: ({ object }) => setSelectedCountId(object.properties.geoid),
        pickable: true,
      }),
    ];
    if (selectedCounty && showAnimatedLayers) {
      layers = [
        ...layers,
        new GeoJsonLayer({
          id: "counties-selected",
          data: [selectedCounty],
          ...BASE_LINE_LAYERS_OPTIONS,
          getFillColor: [0, 0, 0, 122],
          getLineColor: [0, 0, 0, 255],
          lineWidthMinPixels: 1,
          lineWidthMaxPixels: 10,
        }),
        new GeoJsonLayer({
          id: "counties-targets",
          data: targetCounties,
          ...BASE_LINE_LAYERS_OPTIONS,
          getFillColor: [0, 0, 0, 50],
          getLineColor: [0, 0, 0, 150],
          lineWidthMinPixels: 0.5,
          lineWidthMaxPixels: 5,
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
    if (linksAsGeoJSON && showAnimatedLayers) {
      layers.push(
        new GeoJsonLayer({
          id: "lines",
          data: linksAsGeoJSON as any,
          stroked: true,
          lineWidthUnits: "pixels",
          getLineWidth: 0.5,
          getLineColor: [
            linesColor.r,
            linesColor.g,
            linesColor.b,
            linesColor.a * 255,
          ],
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
    linesColor,
  ]);
  return layers;
}
