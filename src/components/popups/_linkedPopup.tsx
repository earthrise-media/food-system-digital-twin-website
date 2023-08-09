import cx from "classnames";
import { useMap } from "react-map-gl";
import { Feature, Geometry } from "geojson";
import { CountyWithRank } from "@/types";
import styles from "@/styles/Popups.module.css";
import { usePopup } from "@/hooks/usePopup";

function LinkedPopup({
  county,
  numPopups,
}: {
  county: Feature<Geometry, CountyWithRank>;
  numPopups: number;
}) {
  const { current: map } = useMap();
  const { name, stusps } = county.properties;

  const zoomThreshold = numPopups > 10 ? 7 : 5.5;
  const showLabel = map ? map?.getZoom() > zoomThreshold : false;

  // With county name
  usePopup({
    county,
    popupOptions: {
      offset: 0,
    },
    className: cx("noTip", styles.linked, {
      [styles.hidden]: !showLabel,
    }),
    children: (
      <div className={cx(styles.popupContent, styles.fixed)}>
        <div className={cx(styles.rank)}>{county.properties.rank}</div>
        <span className={styles.label}>
          {name}, {stusps}
        </span>
      </div>
    ),
  });

  // Only county rank
  usePopup({
    county,
    popupOptions: {
      offset: 0,
    },
    className: cx("noTip noBackground", styles.linked, {
      [styles.hidden]: showLabel,
    }),
    children: (
      <div className={cx(styles.rankWrapper, styles.rank, styles.fixed)}>
        {county.properties.rank}
      </div>
    ),
  });

  return null;
}

export default LinkedPopup;
