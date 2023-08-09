import { useMemo, useState } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { GeoJsonLayer } from "@deck.gl/layers/typed";
import { TripsLayer } from "@deck.gl/geo-layers/typed";
import { Geometry, Feature } from "geojson";
import { County, FlowWithTrips } from "@/types";
import { featureCollection } from "@turf/turf";
import useAnimationFrame from "@/hooks/useAnimationFrame";
import {
  adverseConditionsAtom,
  countiesAtom,
  countyAtom,
  countyHighlightedAtom,
  flowTypeAtom,
  foodGroupAtom,
  highlightedCountyAtom,
  roadsAtom,
  selectedCountyAtom,
} from "@/atoms";
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
  targetCounties: Feature<Geometry, County>[] | null,
  flows: FlowWithTrips[],
  zoom: number,
  showAnimatedLayers = true
) {
  const setCounty = useSetAtom(countyAtom);
  const [foodGroup, setFoodGroup] = useAtom(foodGroupAtom);
  const [countyHiglighted, setCountyHighlighted] = useAtom(
    countyHighlightedAtom
  );
  const highlightedCounty = useAtomValue(highlightedCountyAtom);
  const flowType = useAtomValue(flowTypeAtom);
  const roads = useAtomValue(roadsAtom);

  const counties = useAtomValue(countiesAtom);
  const selectedCounty = useAtomValue(selectedCountyAtom);

  const adverseConditions = useAtomValue(adverseConditionsAtom);
  
  const { linesColor, baseAnimationSpeed } = useControls("layers", {
    linesColor: { r: 0, b: 0, g: 0, a: 0.05 },
    baseAnimationSpeed: 1,
  });
  const baseAnimationSpeedMultiplier = adverseConditions ? 1 : 2;
  
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

  const targetCountyHighlighted = useMemo(() => {
    if (!countyHiglighted) return null;
    const targetCountiesIds = (targetCounties || []).map(
      (c) => c.properties.geoid
    );
    return targetCountiesIds.find((id) => id === countyHiglighted);
  }, [countyHiglighted, targetCounties]);

  const [currentTime, setCurrentTime] = useState(0);
  useAnimationFrame((e: any) => setCurrentTime(e.time));

  const loopLength = 100;

  const currentFrame = useMemo(() => {
    const animationSpeed = baseAnimationSpeedMultiplier * baseAnimationSpeed;
    // const animationSpeedZoom = (1 + MAX_ZOOM - zoom) / (1 + MAX_ZOOM - MIN_ZOOM);
    const animationSpeedZoom = 1;
    const speed = animationSpeed * animationSpeedZoom;
    return (currentTime * speed) % loopLength;
  }, [currentTime, baseAnimationSpeed, baseAnimationSpeedMultiplier, zoom]);

  const layers = useMemo(() => {
    let layers: (GeoJsonLayer | TripsLayer)[] = [
      new GeoJsonLayer({
        id: "counties",
        data: counties as any,
        getFillColor: [0, 0, 0, 0],
        getLineColor: [0, 0, 0, 10],
        lineWidthMinPixels: 1,
        lineWidthMaxPixels: 5,
        onClick: ({ object }) => {
          setCounty(object.properties.geoid);
          setFoodGroup(null);
        },
        onHover: ({ object }) =>
          setCountyHighlighted(object?.properties?.geoid ?? null),
        pickable: true,
      }),
    ];
    if (selectedCounty) {
      layers = [
        ...layers,
        new GeoJsonLayer({
          id: "counties-selected",
          data: [selectedCounty],
          ...BASE_LINE_LAYERS_OPTIONS,
          getFillColor: [0, 0, 0, 0],
          getLineColor: [0, 0, 0, 255],
          lineWidthMinPixels: 1,
          lineWidthMaxPixels: 3,
        }),
      ];
    }
    if (selectedCounty && showAnimatedLayers) {
      layers = [
        ...layers,
        new GeoJsonLayer({
          id: "counties-targets",
          data: targetCounties || [],
          ...BASE_LINE_LAYERS_OPTIONS,
          getFillColor: [0, 0, 0, 0],
          getLineColor: [0, 0, 0, 150],
          lineWidthMinPixels: 1,
          lineWidthMaxPixels: 2,
          getLineWidth: 0.01,
        }),
        new GeoJsonLayer({
          id: "county-hover",
          data: highlightedCounty ? [highlightedCounty] : [],
          ...BASE_LINE_LAYERS_OPTIONS,
          getFillColor: [0, 0, 0, 0],
          getLineColor: [0, 0, 0, 150],
          lineWidthMinPixels: 0.5,
          lineWidthMaxPixels: 2,
          getLineWidth: 0.01,
          visible: !!highlightedCounty,
        }),
        new TripsLayer({
          id: "trips-layer",
          data: allTrips,
          getPath: (d) => d.waypoints.map((p: any) => p.coordinates),
          getTimestamps: (d) => d.waypoints.map((p: any) => p.timestamp),
          getColor: (d) => {
            if (!targetCountyHighlighted && !foodGroup) return d.color;
            const isSelectedCounty =
              flowType === "consumer"
                ? targetCountyHighlighted === d.sourceId
                : targetCountyHighlighted === d.targetId;

            const isSelectedFoodGroup = d.foodGroup === foodGroup;

            if (
              targetCountyHighlighted &&
              isSelectedCounty &&
              (!foodGroup || isSelectedFoodGroup)
            ) {
              return d.color;
            }

            if (!targetCountyHighlighted && foodGroup && isSelectedFoodGroup) {
              return d.color;
            }

            return [0,0,0,0];
          },
          updateTriggers: {
            getColor: [targetCountyHighlighted, foodGroup],
          },
          widthMinPixels: 2.5,
          getWidth: (d) => {
            return 1000;
          },
          capRounded: true,
          jointRounded: true,
          fadeTrail: true,
          trailLength: 0.15,
          currentTime: currentFrame,
        }),
      ];
    }
    if (linksAsGeoJSON && showAnimatedLayers && !roads) {
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
    setFoodGroup,
    targetCountyHighlighted,
    highlightedCounty,
    linesColor,
    showAnimatedLayers,
    flowType,
    foodGroup,
    roads,
  ]);
  return layers;
}
