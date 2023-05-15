import { useEffect } from "react";
import { useMap } from "react-map-gl";
import { Popup as MapboxPopup } from "mapbox-gl";
import { centroid } from "turf";
import useSelectedCounty from "@/hooks/useSelectedCounty";

function Popup() {
  const { current: map } = useMap();
  const selectedCounty = useSelectedCounty();

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
