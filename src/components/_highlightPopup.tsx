import { useEffect } from "react";
import { useMap } from "react-map-gl";
import { Popup as MapboxPopup } from "mapbox-gl";
import { kumbhSans } from "@/pages";
import { useAtomValue } from "jotai";
import { highlightedCountyAtom } from "@/atoms";

function HighlightPopup() {
  const { current: map } = useMap();
  const highlightedCounty = useAtomValue(highlightedCountyAtom)

  useEffect(() => {
    if (!map || !highlightedCounty) return;

    const { name, stusps } = highlightedCounty.properties;
    const popup = new MapboxPopup({ closeOnClick: false, closeButton: false, className: "highlightedPopup" })
      .trackPointer()
      .setHTML(
        `<dl class="${
          kumbhSans.className
        } compact"><dd>${name}, ${stusps}</dd></dl>`
      )
      .addTo(map.getMap());

    return () => {
      popup.remove();
    };
  }, [map, highlightedCounty]);

  return null;
}

export default HighlightPopup;
