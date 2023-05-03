import React, { useMemo, useState } from "react";
import DeckGL from "@deck.gl/react/typed";
import { Map } from "react-map-gl";
import { GeoJsonLayer } from "@deck.gl/layers/typed";
import "mapbox-gl/dist/mapbox-gl.css";
import { FeatureCollection, Geometry } from "geojson";

const INITIAL_VIEW_STATE = {
  longitude: -98,
  latitude: 37,
  zoom: 4,
  pitch: 30,
  bearing: 0,
};

type County = {
  geoid: string;
  name: string;
};

function MapWrapper({
  counties,
}: {
  counties: FeatureCollection<Geometry, County>;
}) {
  const [currentCountyId, selectCurrentCountyId] = useState(null);

  const selectedCounty = useMemo(() => {
    if (!currentCountyId) return null;
    return counties.features.find(
      (county) => county.properties.geoid === currentCountyId
    );
  }, [currentCountyId, counties]);

  const layers = useMemo(() => {
    const layers: GeoJsonLayer[] = [
      new GeoJsonLayer({
        id: "counties",
        data: counties as any,
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
    <DeckGL
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      layers={layers}
    >
      <Map
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        mapStyle="mapbox://styles/fausto-perez/clgnkv1d000dl01qucf7wc8zc"
      />
    </DeckGL>
  );
}

export default MapWrapper;
