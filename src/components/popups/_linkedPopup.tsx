import cx from "classnames";
import { useMap } from "react-map-gl";
import { Feature, Geometry } from "geojson";
import { County, CountyWithRank } from "@/types";
import styles from "@/styles/Popups.module.css";
import { usePopup } from "@/hooks/usePopup";

function LinkedPopup({
  county,
}: {
  county: Feature<Geometry, CountyWithRank>;
}) {
  const { current: map } = useMap();
  const { name, stusps } = county.properties;

  // County name
  usePopup({
    county,
    popupOptions: {
      offset: 20,
    },
    className: cx("noTip", {
      [styles.hidden]: map ? map?.getZoom() < 5.5: false,
    }),
    children: (
      <div className={cx(styles.popupContent, styles.fixed)}>
        {name}, {stusps}
      </div>
    ),
  });

  // County rank
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
