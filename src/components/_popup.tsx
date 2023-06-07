import { useEffect } from "react";
import { useMap } from "react-map-gl";
import { Popup as MapboxPopup } from "mapbox-gl";
import { centroid } from "turf";
import { useAtomValue } from "jotai";
import { flowTypeAtom, selectedCountyAtom } from "@/atoms";
import { kumbhSans } from "@/pages";

function Popup() {
  const { current: map } = useMap();
  const selectedCounty = useAtomValue(selectedCountyAtom)
  const flowType = useAtomValue(flowTypeAtom);

  useEffect(() => {
    if (!map || !selectedCounty) return;

    const { name, stusps } = selectedCounty.properties;
    const popup = new MapboxPopup({ closeOnClick: false, closeButton: false, className: "selectedPopup" })
      .setLngLat(centroid(selectedCounty).geometry.coordinates as any)
      .setHTML(
        `<dl class=${
          kumbhSans.className
        }><dt>${name}, ${stusps}</dt><dd class=${flowType}><b>~323,234 Kcal</b> ${
          flowType === "consumer" ? "consumed" : "produced"
        } </dd></dl>`
      )
      .addTo(map.getMap());

    return () => {
      popup.remove();
    };
  }, [map, selectedCounty, flowType]);

  return null;
}

export default Popup;
