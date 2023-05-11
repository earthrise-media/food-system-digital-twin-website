import { Feature, Geometry } from "geojson";
import { useEffect } from "react";
import { useMap } from "react-map-gl";
import { County } from "@/types";
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
    const popup = new MapboxPopup({ closeOnClick: false, closeButton: false })
      .setLngLat(centroid(selectedCounty).geometry.coordinates as any)
      .setHTML(
        `<dl><dt>${name}, ${stusps}</dt><dd><b>~323,234 Kcal</b> consumed</dd></dl>`
      )
      .addTo(map.getMap());

    return () => {
      popup.remove();
    };
  }, [map, selectedCounty]);

  return null;
}

export default Popup;
