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
import Tabs from "../common/_tabs";
import LineLoader from "../common/_loader";

const TAB_OPTIONS = [
  { label: `Top ${TOP_COUNTIES_NUMBER}`, value: false },
  { label: "All", value: true },
];

export default function CountiesList({ title }: { title: string }) {
  const setCounty = useSetAtom(countyAtom);
  const [countyHiglighted, setCountyHighlighted] = useAtom(
    countyHighlightedAtom
  );
  const [allLinkedCounties, setAllLinkedCounties] = useAtom(
    allLinkedCountiesAtom
  );

  const { linkedCounties, isLoading } = useLinkedCounties();

  return (
    <>
      <div className={styles.titleSection}>
        <h3>{title}</h3>
        {linkedCounties.length > TOP_COUNTIES_NUMBER && (
          <Tabs
            options={TAB_OPTIONS}
            selectedOption={allLinkedCounties}
            onChange={(value) => setAllLinkedCounties(value)}
          />
        )}
      </div>
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
              {isLoading ? (
                <LineLoader width={130} />
              ) : (
                <>
                  {" "}
                  {county.properties.name}, {county.properties.stusps}
                </>
              )}
            </li>
          ))}
      </ol>
    </>
  );
}
