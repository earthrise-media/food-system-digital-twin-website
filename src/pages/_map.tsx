import React from 'react';
import DeckGL from '@deck.gl/react/typed';
import {Map} from 'react-map-gl';

// Viewport settings
const INITIAL_VIEW_STATE = {
  longitude: -122.41669,
  latitude: 37.7853,
  zoom: 13,
  pitch: 0,
  bearing: 0
};

function MapWrapper() {
  const layers: any[] = [];

  return (
    <DeckGL
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      layers={layers}
    >
      <Map mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN} />
    </DeckGL>
  );
}

export default MapWrapper