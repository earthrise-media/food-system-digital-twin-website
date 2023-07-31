import cx from "classnames";
import { Feature, Geometry } from "geojson";
import { Category, CountyWithRank } from "@/types";
import styles from "@/styles/Popups.module.css";
import { usePopup } from "@/hooks/usePopup";
import { useMemo } from "react";
import { useLinkedFlows } from "@/hooks/useLinkedCounties";
import { CATEGORIES_PROPS } from "@/constants";

function HighlightedLinkedPopup({
  county,
}: {
  county: Feature<Geometry, CountyWithRank>;
}) {
  const { name, stusps } = county.properties;
  const flows = useLinkedFlows();

  const cropGroupsInLinkedCounty = useMemo(() => {
    if (!flows) return null;
    const flowsForCounty = flows.find(
      (flow) => flow.county_id === county.properties.geoid
    );
    if (!flowsForCounty) return null;
    const cropGroupsIds = flowsForCounty?.flowsByCropGroup.map(
      (c) => c.crop_category
    );
    return cropGroupsIds;
  }, [flows, county]);

  usePopup({
    county,
    popupOptions: {
      offset: 0,
    },
    className: "",
    children: (
      <div className={cx(styles.popupContent, styles.fixed, styles.highlightedLinked)}>
        <div className={styles.rank}>{county.properties.rank}</div>
        <div>
          {" "}
          {name}, {stusps}
          <ul>
            {cropGroupsInLinkedCounty?.map((cropGroup) => (
              <li
                key={cropGroup}
                style={
                  {
                    "--color": CATEGORIES_PROPS[cropGroup].color,
                  } as React.CSSProperties
                }
              >
                {cropGroup}
              </li>
            ))}
          </ul>
        </div>
      </div>
    ),
  });

  return null;
}

export default HighlightedLinkedPopup;
