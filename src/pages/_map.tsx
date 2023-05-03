import React, { useEffect, useMemo, useState } from "react";
import DeckGL from "@deck.gl/react/typed";
import { MapboxOverlay, MapboxOverlayProps } from "@deck.gl/mapbox/typed";
import { Map, useControl } from "react-map-gl";
import { GeoJsonLayer } from "@deck.gl/layers/typed";
import "mapbox-gl/dist/mapbox-gl.css";
import { FeatureCollection, Geometry } from "geojson";
import Popup from "@/pages/_popup";

const INITIAL_VIEW_STATE = {
  longitude: -98,
  latitude: 37,
  zoom: 4,
  pitch: 30,
  bearing: 0,
};

export type County = {
  geoid: string;
  name: string;
  stusps: string;
};

function DeckGLOverlay(props: MapboxOverlayProps) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

function MapWrapper({
  counties,
}: {
  counties: FeatureCollection<Geometry, County>;
}) {
  const [currentCountyId, selectCurrentCountyId] = useState(null);

  const selectedCounty = useMemo(() => {
    if (!currentCountyId) return;
    return counties.features.find(
      (county) => county.properties.geoid === currentCountyId
    );
  }, [currentCountyId, counties]);

  const layers = useMemo(() => {
    const layers: GeoJsonLayer[] = [
      new GeoJsonLayer({
        id: "counties",
        data: counties,
        stroked: true,
        filled: true,
        getFillColor: [0, 0, 0, 0],
        getLineColor: [246, 243, 239, 255],
        lineWidthScale: 5000,
        lineWidthMinPixels: 1,
        getLineWidth: 1,
        onClick: ({ object }) => selectCurrentCountyId(object.properties.geoid),
        pickable: true,
      }),
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
    ];
    return layers;
  }, [counties, selectedCounty]);

  return (
    <Map
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
      mapStyle="mapbox://styles/fausto-perez/clgnkv1d000dl01qucf7wc8zc"
      initialViewState={INITIAL_VIEW_STATE}
    >
      <DeckGLOverlay layers={layers} />
      <Popup selectedCounty={selectedCounty} />
    </Map>
  );
}

export default MapWrapper;
