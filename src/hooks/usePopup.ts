import classNames from "classnames";
import { PopupOptions } from "mapbox-gl";
import { ReactNode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { useMap } from "react-map-gl";
import { Popup as MapboxPopup } from "mapbox-gl";
import styles from "@/styles/Popups.module.css";
import { kumbhSans } from "@/pages";
import { centroid } from "turf";
import { County } from "@/types";
import { Feature, Geometry } from "geojson";

export function usePopup({
  children,
  popupOptions,
  className,
  county,
  trackPointer,
}: {
  children: ReactNode;
  popupOptions: PopupOptions;
  className: string;
  county: Feature<Geometry, County>;
  trackPointer?: boolean;
}) {
  const { current: map } = useMap();

  useEffect(() => {
    if (!map || !county) return;

    const rootElement = document.createElement("div");
    const root = createRoot(rootElement);
    root.render(children);

    const popup = new MapboxPopup({
      closeOnClick: false,
      closeButton: false,
      offset: 20,
      ...popupOptions,
      // className: classNames(styles.popup, kumbhSans.className, "noTip"),
      className: classNames(styles.popup, kumbhSans.className, className),
    })
      .setLngLat(centroid(county).geometry.coordinates as any)
      .setDOMContent(rootElement)
      .addTo(map.getMap());
    if (trackPointer) {
      popup.trackPointer();
    }
    return () => {
      popup.remove();
    };
  }, [map, county, className]);
}
