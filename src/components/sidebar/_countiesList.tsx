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
import { SIDEBAR_WIDTH, TOP_COUNTIES_NUMBER } from "@/constants";
import Tabs from "../common/_tabs";
import LineLoader from "../common/_loader";
import { useCallback } from "react";
import { useMap } from "react-map-gl";
import { centroid } from "turf";

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

  const { map } = useMap();
  const centerMap = useCallback(
    (county: Feature) => {
      map?.flyTo({
        center: centroid(county).geometry.coordinates as any,
        padding: { left: SIDEBAR_WIDTH, top: 0, right: 0, bottom: 0 },
      });
    },
    [map]
  );

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
                  {countyHiglighted === county.properties.geoid && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        centerMap(county);
                      }}
                      className={styles.center}
                    >
                      Center on map
                    </button>
                  )}
                </>
              )}
            </li>
          ))}
      </ol>
    </>
  );
}
