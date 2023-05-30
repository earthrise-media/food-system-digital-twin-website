import { useMemo, useState } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { GeoJsonLayer } from "@deck.gl/layers/typed";
import { TripsLayer } from "@deck.gl/geo-layers/typed";
import { Geometry, Feature } from "geojson";
import { County, FlowWithTrips } from "@/types";
import { featureCollection } from "@turf/turf";
import useAnimationFrame from "@/hooks/useAnimationFrame";
import {
  countiesAtom,
  countyAtom,
  countyHighlightedAtom,
  flowTypeAtom,
  foodGroupAtom,
} from "@/atoms";
import useSelectedCounty from "./useSelectedCounty";
import { useControls } from "leva";

const BASE_LINE_LAYERS_OPTIONS = {
  stroked: true,
  filled: true,
  lineCapRounded: true,
  lineJointRounded: true,
  lineWidthScale: 5000,
  getLineWidth: 1,
};

export default function useLayers(
  targetCounties: Feature<Geometry, County>[],
  flows: FlowWithTrips[],
  showAnimatedLayers = true
) {
  const setCounty = useSetAtom(countyAtom);
  const [countyHiglighted, setCountyHighlighted] = useAtom(
    countyHighlightedAtom
  );
  const flowType = useAtomValue(flowTypeAtom);

  const counties = useAtomValue(countiesAtom);
  const selectedCounty = useSelectedCounty();
  const { linesColor, animationSpeed } = useControls("layers", {
    linesColor: { r: 200, b: 125, g: 106, a: 0.2 },
    animationSpeed: 1,
  });

  const foodGroup = useAtomValue(foodGroupAtom);

  const linksAsGeoJSON = useMemo(() => {
    if (!flows.length) return null;
    const features = flows
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
  }, [flows]);

  const allTrips = useMemo(() => {
    if (!flows.length) return [];
    return flows.flatMap((l) =>
      l.trips.map((t) => {
        return { ...t, sourceId: l.sourceId, targetId: l.targetId };
      })
    );
  }, [flows]);

  const targetCountyHiglighted = useMemo(() => {
    if (!countyHiglighted) return null;
    const targetCountiesIds = targetCounties.map((c) => c.properties.geoid);
    return targetCountiesIds.find((id) => id === countyHiglighted);
  }, [countyHiglighted, targetCounties]);

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
        getLineColor: [0, 0, 0, 0],
        lineWidthMinPixels: 1,
        lineWidthMaxPixels: 5,
        onClick: ({ object }) => setCounty(object.properties.geoid),
        onHover: ({ object }) =>
          setCountyHighlighted(object?.properties?.geoid ?? null),
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
          getColor: (d) => {
            if (!targetCountyHiglighted && !foodGroup) return d.color;
            const isSelectedCounty =
              flowType === "consumer"
                ? targetCountyHiglighted === d.sourceId
                : targetCountyHiglighted === d.targetId;

            const isSelectedFoodGroup = d.foodGroup === foodGroup;

            if (targetCountyHiglighted && isSelectedCounty && (!foodGroup || isSelectedFoodGroup)) {
              return d.color
            }

            if (!targetCountyHiglighted &&foodGroup && isSelectedFoodGroup) {
              return d.color
            }

            return [...d.color.slice(0, 3), 30];
          },
          updateTriggers: {
            getColor: [targetCountyHiglighted, foodGroup],
          },
          widthMinPixels: 2.5,
          getWidth: (d) => {
            return 5000;
          },
          capRounded: true,
          jointRounded: true,
          fadeTrail: true,
          trailLength: 0.15,
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
    setCounty,
    setCountyHighlighted,
    targetCountyHiglighted,
    linesColor,
    showAnimatedLayers,
    flowType,
    foodGroup,
  ]);
  return layers;
}
