import cx from "classnames";
import {
  allLinkedCountiesAtom,
  countyAtom,
  countyHighlightedAtom,
} from "@/atoms";
import useLinkedCounties from "@/hooks/useLinkedCounties";
import { County } from "@/types";
import { Feature, Geometry } from "geojson";
import { useAtom, useSetAtom } from "jotai";
import styles from "@/styles/CountiesList.module.css";
import { TOP_COUNTIES_NUMBER } from "@/constants";

export default function CountiesList() {
  const setCounty = useSetAtom(countyAtom);
  const [countyHiglighted, setCountyHighlighted] = useAtom(
    countyHighlightedAtom
  );
  const [allLinkedCounties, setAllLinkedCounties] = useAtom(
    allLinkedCountiesAtom
  );

  const linkedCounties = useLinkedCounties();

  // TODO add loading state
  if (!linkedCounties) return null;
  return (
    <>
      <ol className={styles.countiesList}>
        {linkedCounties
          .slice(
            0,
            allLinkedCounties ? Number.POSITIVE_INFINITY : TOP_COUNTIES_NUMBER
          )
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
      {linkedCounties.length > TOP_COUNTIES_NUMBER && (
        <button
          onClick={() => setAllLinkedCounties(!allLinkedCounties)}
          className={styles.showAll}
        >
          {allLinkedCounties
            ? `Show top ${TOP_COUNTIES_NUMBER} counties`
            : `+ ${linkedCounties.length - TOP_COUNTIES_NUMBER} more`}
        </button>
      )}
    </>
  );
}
