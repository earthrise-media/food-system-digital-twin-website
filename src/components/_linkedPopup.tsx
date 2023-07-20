import cx from "classnames";
import { useMap } from "react-map-gl";
import { Feature, Geometry } from "geojson";
import { County } from "@/types";
import styles from "@/styles/Popups.module.css";
import { usePopup } from "@/hooks/usePopup";

export type LinkedPopupCounty = {
  rank: number;
} & County;

function LinkedPopup({
  county,
}: {
  county: Feature<Geometry, LinkedPopupCounty>;
}) {
  const { current: map } = useMap();
  const { name, stusps } = county.properties;
  usePopup({
    county,
    popupOptions: {
      offset: 20,
    },
    className: cx("noTip", {
      [styles.hidden]: map ? map?.getZoom() < 5 : false,
    }),
    children: (
      <div className={cx(styles.popupContent, styles.fixed)}>
        {name}, {stusps}
      </div>
    ),
  });
  usePopup({
    county,
    popupOptions: {
      anchor: "center",
    },
    className: "noTip",
    children: (
      <div className={cx(styles.rank, styles.fixed)}>
        {county.properties.rank}
      </div>
    ),
  });

  return null;
}

export default LinkedPopup;
