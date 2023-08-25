import { usePopup } from "@/hooks/usePopup";
import { Feature, Geometry } from "geojson";
import { County } from "@/types";
import classNames from "classnames";
import styles from "@/styles/Popups.module.css";

function SelectedPopup({ county }: { county: Feature<Geometry, County> }) {
  const { name, stusps } = county.properties;
  usePopup({
    county,
    popupOptions: {
      offset: 20,
    },
    className: classNames("noTip", styles.selected),
    children: (
      <div
        className={classNames(
          styles.popupContent,
          styles.fixed,
          styles.mainPopup
        )}
      >
        {name}, {stusps}
      </div>
    ),
  });

  return null;
}

export default SelectedPopup;
