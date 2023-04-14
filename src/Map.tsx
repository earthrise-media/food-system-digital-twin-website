import React, { useState, useMemo, useEffect } from "react";
import { Map } from "react-map-gl";
import maplibregl from "maplibre-gl";
import DeckGL from "@deck.gl/react/typed";
import { GeoJsonLayer, ArcLayer } from "@deck.gl/layers/typed";
import { TripsLayer } from "@deck.gl/geo-layers/typed";
import { scaleQuantile, scaleSequential, scaleLinear } from "d3-scale";
import { interpolateSpectral } from "d3-scale-chromatic";
import { max } from "d3-array";
import { rgb } from "d3-color";
import { centroid } from "@turf/turf";
import useAnimationFrame from "./useAnimationFrame";

const TRIPS_TEST_DATA: [number, number][] = [
  [-122.3907988, 37.7664413],
  [-77.096218242053, 38.9451068637527],
];

const INITIAL_VIEW_STATE = {
  longitude: -100,
  latitude: 40.7,
  zoom: 3,
  maxZoom: 15,
  pitch: 30,
  bearing: 30,
};

const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json";

type Arc = {
  source: [number, number];
  target: [number, number];
  value: number;
  width: number;
  color: [number, number, number, number];
};

function calculateArcs2(
  counties: any,
  selectedCounty: any,
  links: any
): undefined | Arc[] {
  const selectedCountyLinks = links.find(
    (l: any) => l.Supply === (selectedCounty as any)?.properties.GEOID
  );
  if (!selectedCountyLinks) return;

  const targetsGeoIds = Object.entries(selectedCountyLinks).filter(
    ([k, v]) => (v as number) > 0
  );

  let arcs = targetsGeoIds.flatMap(([k, v]) => {
    const target = counties.find((c: any) => c.properties.GEOID === k);
    if (!target || !target.geometry) return [];

    return [
      {
        source: centroid(selectedCounty).geometry.coordinates,
        target: centroid(target).geometry.coordinates,
        value: v,
      },
    ];
  });

  const maxValue = max(arcs.map((a: any) => a.value));
  const scale = scaleLinear().domain([0, maxValue]).range([0, 5]);
  const scaleColor = scaleSequential()
    .domain([maxValue, 0])
    .interpolator(interpolateSpectral);

  arcs = arcs.map((a: any) => {
    const rgbColor = rgb(scaleColor(a.value)).rgb();
    const deckColor = [rgbColor.r, rgbColor.g, rgbColor.b, 255];
    return {
      ...a,
      width: scale(a.value),
      color: deckColor,
    };
  });

  return arcs as Arc[];
}

const getTrip = (
  from: [number, number],
  to: [number, number],
  {
    numParticles = 100,
    fromTimestamp = 0,
    toTimeStamp = 100,
    intervalHumanize = 0.5,
    duration = 10,
    durationHumanize = 0.2,
  } = {},
  copyProps: any = {}
) => {
  const d = toTimeStamp - fromTimestamp;

  const interval = d / numParticles;

  const waypoints = [];
  for (let i = 0; i < numParticles; i++) {
    const humanizeInterval =
      (Math.random() - 0.5) * 2 * interval * intervalHumanize;
    const timestampStart = fromTimestamp + i * interval + humanizeInterval;
    const humanizeDuration =
      (Math.random() - 0.5) * 2 * duration * durationHumanize;
    const timestampEnd = timestampStart + duration + humanizeDuration;

    waypoints.push({
      ...copyProps,
      waypoints: [
        { coordinates: from, timestamp: timestampStart },
        { coordinates: to, timestamp: timestampEnd },
      ],
    });
  }

  return waypoints;
};

const getTripsFromArcs = (arcs: Arc[]) => {
  const trips = arcs.map((arc) => {
    return getTrip(arc.source, arc.target, { numParticles: 100}, arc);
  });
  console.log(trips);
  return trips.flat();
};

// const TRIPS = getTrip(TRIPS_TEST_DATA[0], TRIPS_TEST_DATA[1]);

function getTooltip({ object }: any) {
  return object && object.properties.name;
}

export default function MapWrapper({
  data = [],
  counties = [],
  links = [],
  strokeWidth = 1,
  mapStyle = MAP_STYLE,
}) {
  const [selectedCounty2, selectCounty2] = useState();

  const arcs2 = useMemo(
    () => calculateArcs2(counties, selectedCounty2, links),
    [counties, selectedCounty2, links]
  );
  // console.log((selectedCounty2 as any)?.properties.GEOID, arcs2);

  const arcTrips = useMemo(() => {
    if (!arcs2) return [];
    const trips = getTripsFromArcs(arcs2);
    console.log(trips);
    return trips;
  }, [arcs2]);

  const [currentTime, setCurrentTime] = useState(0);
  useAnimationFrame((e: any) => setCurrentTime(e.time));
  const animationSpeed = 2;
  const loopLength = 100;

  const currentFrame = useMemo(() => {
    return (currentTime * animationSpeed) % loopLength;
  }, [currentTime]);

  const [layerType, setLayerType] = useState("trips");
  const onLayerTypeSelect = (e: any) => {
    setLayerType(e.target.value);
  };

  const layers = useMemo(() => {
    let layers = [
      new GeoJsonLayer({
        id: "counties",
        data: counties,
        stroked: true,
        filled: true,
        getFillColor: [0, 0, 0, 255],
        getLineColor: [255, 255, 2550, 50],
        lineWidthMinPixels: 1,
        onClick: ({ object }) => selectCounty2(object),
        pickable: true,
      }),
    ];

    if (layerType === "trips") {
      layers = [
        ...(layers as any),
        new TripsLayer({
          id: "trips-layer",
          data: arcTrips,
          getPath: (d) => d.waypoints.map((p: any) => p.coordinates),
          getTimestamps: (d) => d.waypoints.map((p: any) => p.timestamp),
          getColor: (d) => d.color,
          opacity: 0.8,
          widthMinPixels: .5,
          getWidth: (d) => {
            // console.log(d.width)
            return d.width * 1500
          },
          rounded: true,
          fadeTrail: true,
          trailLength: 0.9,
          currentTime: currentFrame,
        }),
      ];
    } else {
      layers = [
        ...(layers as any),
        new ArcLayer({
          id: "arc2",
          data: arcs2 as any,
          getSourcePosition: (d) => d.source,
          getTargetPosition: (d) => d.target,
          // getSourceColor: ((d: any) => (d.gain > 0 ? inFlowColors : outFlowColors)[d.quantile]) as any,
          // getTargetColor: ((d: any) => (d.gain > 0 ? outFlowColors : inFlowColors)[d.quantile]) as any,
          getWidth: (d) => d.width,
          getSourceColor: (d) => d.color,
          getTargetColor: (d) => d.color,
        }),
      ];
    }
    return layers;
  }, [layerType, arcs2, counties, currentFrame]);

  return (
    <>
      <div style={{ position: "absolute", zIndex: 99 }}>
        <div onChange={onLayerTypeSelect}>
          <input
            type="radio"
            value="arcs"
            name="layerType"
            checked={layerType === "arcs"}
          />{" "}
          arcs
          <input
            type="radio"
            value="trips"
            name="gender"
            checked={layerType === "trips"}
          />{" "}
          trips
        </div>
        {currentFrame}
      </div>
      <DeckGL
        layers={layers as any}
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        getTooltip={getTooltip}
      >
        <Map reuseMaps mapLib={maplibregl} mapStyle={mapStyle} />
      </DeckGL>
    </>
  );
}
