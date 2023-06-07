import { useEffect } from "react";
import { useMap } from "react-map-gl";
import { Popup as MapboxPopup } from "mapbox-gl";
import { useHighlightedCounty } from "@/hooks/useSelectedCounty";
import { kumbhSans } from "@/pages";
import { Feature, Geometry } from "geojson";
import { County } from "@/types";
import { centroid } from "turf";

function LinkedPopup({ county }: { county: Feature<Geometry, County> }) {
  const { current: map } = useMap();

  useEffect(() => {
    if (!map || !county) return;

    const { name, stusps } = county.properties;
    const popup = new MapboxPopup({ closeOnClick: false, closeButton: false, className: "linkedPopup", offset: 12 })
      .setLngLat(centroid(county).geometry.coordinates as any)
      .setHTML(
        `<dl class="${kumbhSans.className} compact"><dd>${name}, ${stusps}</dd></dl>`
      )
      .addTo(map.getMap());

    return () => {
      popup.remove();
    };
  }, [map, county]);

  return null;
}

export default LinkedPopup;
