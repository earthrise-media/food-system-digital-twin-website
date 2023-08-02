import { Feature, Geometry } from "geojson";
import { County } from "@/types";
import { usePopup } from "@/hooks/usePopup";
import classNames from "classnames";
import styles from "@/styles/Popups.module.css";

function HighlightPopup({ county }: { county: Feature<Geometry, County> }) {
  const { name, stusps } = county.properties;
  usePopup({
    county,
    popupOptions: {
      offset: 2,
    },
    className: "",
    children: (
      <div className={classNames(styles.popupContent)}>
        {name}, {stusps}
      </div>
    ),
    trackPointer: true,
  });

  return null;
}

export default HighlightPopup;
