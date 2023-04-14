import React, { useState, useMemo } from "react";
import { Map } from "react-map-gl";
import maplibregl from "maplibre-gl";
import DeckGL from "@deck.gl/react/typed";
import { GeoJsonLayer, ArcLayer } from "@deck.gl/layers/typed";
import { scaleQuantile, scaleSequential, scaleLinear } from "d3-scale";
import { interpolateSpectral } from "d3-scale-chromatic";
import { max } from "d3-array";
import { rgb } from "d3-color";
import { centroid } from "@turf/turf";

export const inFlowColors = [
  [255, 255, 204],
  [199, 233, 180],
  [127, 205, 187],
  [65, 182, 196],
  [29, 145, 192],
  [34, 94, 168],
  [12, 44, 132],
];

export const outFlowColors = [
  [255, 255, 178],
  [254, 217, 118],
  [254, 178, 76],
  [253, 141, 60],
  [252, 78, 42],
  [227, 26, 28],
  [177, 0, 38],
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

function calculateArcs(data: any, selectedCounty: any) {
  if (!data || !data.length) {
    return null;
  }
  if (!selectedCounty) {
    selectedCounty = data.find(
      (f: any) => f.properties.name === "Los Angeles, CA"
    );
  }
  const { flows, centroid } = selectedCounty.properties;

  const arcs = Object.keys(flows).map((toId) => {
    const f = data[toId];
    return {
      source: centroid,
      target: f.properties.centroid,
      value: flows[toId],
    };
  });

  const scale = scaleQuantile()
    .domain(arcs.map((a) => Math.abs(a.value)))
    .range(inFlowColors.map((c, i) => i));

  arcs.forEach((a: any) => {
    a.gain = Math.sign(a.value);
    a.quantile = scale(Math.abs(a.value));
  });

  return arcs;
}

function calculateArcs2(counties: any, selectedCounty: any, links: any) {
  const selectedCountyLinks = links.find(
    (l: any) => l.Supply === (selectedCounty as any)?.properties.GEOID
  );
  if (!selectedCountyLinks) return null;

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
  const scaleColor = scaleSequential().domain([maxValue, 0 ])
  .interpolator(interpolateSpectral);

  arcs = arcs.map((a: any) => {
    const rgbColor = rgb(scaleColor(a.value)).rgb()
    const deckColor = [rgbColor.r, rgbColor.g, rgbColor.b, 255]
    return {
    ...a,
    width: scale(a.value),
    color: deckColor,
  }}) as any;

  return arcs;
}

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
  const [selectedCounty, selectCounty] = useState(null);
  const [selectedCounty2, selectCounty2] = useState();

  const arcs = useMemo(
    () => calculateArcs(data, selectedCounty),
    [data, selectedCounty]
  );
  const arcs2 = useMemo(
    () => calculateArcs2(counties, selectedCounty2, links),
    [counties, selectedCounty2, links]
  );
  console.log((selectedCounty2 as any)?.properties.GEOID, arcs2);

  const layers = [
    new GeoJsonLayer({
      id: "geojson",
      data,
      stroked: false,
      filled: true,
      getFillColor: [0, 0, 0, 0],
      onClick: ({ object }) => selectCounty(object),
      pickable: true,
    }),
    new GeoJsonLayer({
      id: "counties",
      data: counties,
      stroked: true,
      filled: true,
      getFillColor: [100, 100, 100, 255],
      getLineColor: [0, 255, 0, 255],
      onClick: ({ object }) => selectCounty2(object),
      pickable: true,
    }),
    // new ArcLayer({
    //   id: "arc",
    //   data: arcs as any,
    //   getSourcePosition: (d) => d.source,
    //   getTargetPosition: (d) => d.target,
    //   getSourceColor: ((d: any) =>
    //     (d.gain > 0 ? inFlowColors : outFlowColors)[d.quantile]) as any,
    //   getTargetColor: ((d: any) =>
    //     (d.gain > 0 ? outFlowColors : inFlowColors)[d.quantile]) as any,
    //   getWidth: strokeWidth,
    // }),
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

  return (
    <DeckGL
      layers={layers}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      getTooltip={getTooltip}
    >
      <Map reuseMaps mapLib={maplibregl} mapStyle={mapStyle} />
    </DeckGL>
  );
}
