import { Feature, Geometry } from "geojson";
import React, { useEffect, useMemo, useState } from "react";
import { useMap } from "react-map-gl";
import { County } from "./_map";
import { Popup as MapboxPopup } from "mapbox-gl";
import { centroid } from "turf";

function Popup({
  selectedCounty,
}: {
  selectedCounty?: Feature<Geometry, County>;
}) {
  const { current: map } = useMap();

  useEffect(() => {
    if (!map || !selectedCounty) return;

    const { name, stusps } = selectedCounty.properties;
    const popup = new MapboxPopup({ closeOnClick: false })
      .setLngLat(centroid(selectedCounty).geometry.coordinates as any)
      .setHTML(`${name}, ${stusps}`)
      .addTo(map.getMap());

      return () => {
        popup.remove();
      }
  }, [map, selectedCounty]);

  return null;
}

export default Popup;
