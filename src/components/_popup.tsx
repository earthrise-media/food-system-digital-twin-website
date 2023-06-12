import { useEffect, useMemo } from "react";
import { useMap } from "react-map-gl";
import { Popup as MapboxPopup } from "mapbox-gl";
import { centroid } from "turf";
import { useAtomValue } from "jotai";
import { flowTypeAtom, selectedCountyAtom } from "@/atoms";
import { kumbhSans } from "@/pages";
import { useFlowsData } from "@/hooks/useAPI";

function Popup() {
  const { current: map } = useMap();
  const selectedCounty = useAtomValue(selectedCountyAtom);
  const flowType = useAtomValue(flowTypeAtom);

  const { data: flowsData, error, isLoading } = useFlowsData();

  const total = useMemo(() => {
    if (!flowsData) return null;
    const total = flowsData.stats.byCropGroup.reduce(
      (acc, curr) => acc + curr.value,
      0
    );
    return new Intl.NumberFormat("en-US", {
      maximumSignificantDigits: 3,
    }).format(total / 1000000);
  }, [flowsData]);

  useEffect(() => {
    if (!map || !selectedCounty) return;

    const { name, stusps } = selectedCounty.properties;
    const popup = new MapboxPopup({
      closeOnClick: false,
      closeButton: false,
      className: "selectedPopup",
    })
      .setLngLat(centroid(selectedCounty).geometry.coordinates as any)
      .setHTML(
        `<dl class=${
          kumbhSans.className
        }><dt>${name}, ${stusps}</dt><dd class=${flowType}><b>~${
          total ? total : ""
        } million Kcal</b> ${
          flowType === "consumer" ? "consumed" : "produced"
        } </dd></dl>`
      )
      .addTo(map.getMap());

    return () => {
      popup.remove();
    };
  }, [map, selectedCounty, flowType, total]);

  return null;
}

export default Popup;
