import cx from "classnames";
import { countyAtom, countyHighlightedAtom } from "@/atoms";
import useLinkedCounties from "@/hooks/useLinkedCounties";
import { County } from "@/types";
import { Feature, Geometry } from "geojson";
import { useAtom, useSetAtom } from "jotai";
import styles from "@/styles/CountiesList.module.css";
import { useState } from "react";

const TOP_NUMBER = 5;

export default function CountiesList() {
  const setCounty = useSetAtom(countyAtom);
  const [countyHiglighted, setCountyHighlighted] = useAtom(
    countyHighlightedAtom
  );

  const topLinkedCountries = useLinkedCounties();

  const [showAllCounties, setShowAllCounties] = useState(false);

  // TODO add loading state
  if (!topLinkedCountries) return null;
  return (
    <>
      <ol className={styles.countiesList}>
        {topLinkedCountries
          .slice(0, showAllCounties ? Number.POSITIVE_INFINITY : TOP_NUMBER)
          .map((county: Feature<Geometry, County>) => (
            <li
              onMouseOver={() => setCountyHighlighted(county.properties.geoid)}
              onMouseOut={() => setCountyHighlighted(null)}
              key={county.properties.geoid}
              className={cx({
                [styles.highlighted]:
                  countyHiglighted === county.properties.geoid,
              })}
              onClick={() => {
                setCounty(county.properties.geoid);
                setCountyHighlighted(null);
              }}
            >
              {county.properties.name}, {county.properties.stusps}
            </li>
          ))}
      </ol>
      {topLinkedCountries.length > TOP_NUMBER && (
        <button
          onClick={() => setShowAllCounties(!showAllCounties)}
          className={styles.showAll}
        >
          {showAllCounties
            ? `Show top ${TOP_NUMBER} counties`
            : `+ ${topLinkedCountries.length - TOP_NUMBER} more`}
        </button>
      )}
    </>
  );
}
