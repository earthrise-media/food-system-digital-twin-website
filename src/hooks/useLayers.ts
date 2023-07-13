import { use, useMemo, useState } from "react";
import GL from "@luma.gl/constants";
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
  selectedCountyAtom,
} from "@/atoms";
import { useControls } from "leva";
import { MAX_ZOOM, MIN_ZOOM } from "@/components/_map";

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
  zoom: number,
  showAnimatedLayers = true
) {
  const setCounty = useSetAtom(countyAtom);
  const [foodGroup, setFoodGroup] = useAtom(foodGroupAtom);
  const [countyHiglighted, setCountyHighlighted] = useAtom(
    countyHighlightedAtom
  );
  const flowType = useAtomValue(flowTypeAtom);

  const counties = useAtomValue(countiesAtom);
  const selectedCounty = useAtomValue(selectedCountyAtom);
  const { linesColor, baseAnimationSpeed } = useControls("layers", {
    // linesColor: { r: 0, b: 0, g: 0, a: 0.05 },
    linesColor: { r: 0, b: 245, g: 100, a: 1 },
    baseAnimationSpeed: 3,
  });

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
    const animationSpeed = (1 + MAX_ZOOM - zoom) / (1 + MAX_ZOOM - MIN_ZOOM);
    const speed = animationSpeed * baseAnimationSpeed;
    return (currentTime * speed) % loopLength;
  }, [currentTime, baseAnimationSpeed, zoom]);

  const layers = useMemo(() => {
    let layers: (GeoJsonLayer | TripsLayer)[] = [
      new GeoJsonLayer({
        id: "counties",
        data: counties as any,
        ...BASE_LINE_LAYERS_OPTIONS,
        getFillColor: [0, 0, 0, 0],
        getLineColor: [0, 0, 0, 0],
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
          lineWidthMaxPixels: 3,
        }),
        new GeoJsonLayer({
          id: "counties-targets",
          data: targetCounties,
          ...BASE_LINE_LAYERS_OPTIONS,
          getFillColor: [0, 0, 0, 50],
          getLineColor: [0, 0, 0, 150],
          lineWidthMinPixels: 0.5,
          lineWidthMaxPixels: 2,
          getLineWidth: 0.01,
        }),
        // new TripsLayer({
        //   id: "trips-layer",
        //   data: allTrips,
        //   getPath: (d) => d.waypoints.map((p: any) => p.coordinates),
        //   getTimestamps: (d) => d.waypoints.map((p: any) => p.timestamp),
        //   // opacity: 0.8,
        //   getColor: (d) => {
        //     if (!targetCountyHiglighted && !foodGroup) return d.color;
        //     const isSelectedCounty =
        //       flowType === "consumer"
        //         ? targetCountyHiglighted === d.sourceId
        //         : targetCountyHiglighted === d.targetId;

        //     const isSelectedFoodGroup = d.foodGroup === foodGroup;

        //     if (
        //       targetCountyHiglighted &&
        //       isSelectedCounty &&
        //       (!foodGroup || isSelectedFoodGroup)
        //     ) {
        //       return d.color;
        //     }

        //     if (!targetCountyHiglighted && foodGroup && isSelectedFoodGroup) {
        //       return d.color;
        //     }

        //     return [...d.color.slice(0, 3), 55];
        //   },
        //   updateTriggers: {
        //     getColor: [targetCountyHiglighted, foodGroup],
        //   },
        //   widthMinPixels: 2.5,
        //   getWidth: (d) => {
        //     return 1000;
        //   },
        //   capRounded: true,
        //   jointRounded: true,
        //   fadeTrail: true,
        //   trailLength: 0.15,
        //   currentTime: currentFrame,
        // }),
      ];
    }
    if (linksAsGeoJSON && showAnimatedLayers) {
      layers.push(
        new GeoJsonLayer({
          id: "lines",
          data: linksAsGeoJSON as any,
          stroked: true,
          lineWidthUnits: "pixels",
          getLineWidth: 4,
          getLineColor: [
            linesColor.r,
            linesColor.g,
            linesColor.b,
            linesColor.a * 255,
          ],
          parameters: {
            // blendFunc: [GL.DST_ALPHA, GL.ONE, GL.ONE, GL.ONE_MINUS_SRC_ALPHA],
            // blendEquation: [GL.FUNC_ADD, GL.FUNC_ADD],
            blendFunc: [GL.SRC_ALPHA, GL.ONE, GL.ONE_MINUS_DST_ALPHA, GL.ONE],
            blendEquation: GL.FUNC_ADD

          },
          opacity: 0.8,
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
    targetCountyHiglighted,
    linesColor,
    showAnimatedLayers,
    flowType,
    foodGroup,
  ]);
  return layers;
}
