import React, { useCallback, useMemo } from "react";
import styles from "@/styles/FlowInfo.module.css";
import { CATEGORIES, CATEGORIES_PROPS } from "@/constants";
import cx from "classnames";
import { useAtom, useAtomValue } from "jotai";
import Logo from "./_logo";
import {
  flowTypeAtom,
  searchAtom,
  foodGroupAtom,
  selectedCountyAtom,
  countyHighlightedAtom,
} from "@/atoms";
import { Category, County } from "@/types";
import { useCountyData, useFlowsData } from "@/hooks/useAPI";
import classNames from "classnames";
import { getStats } from "@/utils";
import useLinkedCounties from "@/hooks/useLinkedCounties";
import { Feature, Geometry } from "geojson";

type FlowInfoProps = {};

function FlowInfo({}: FlowInfoProps) {
  const selectedCounty = useAtomValue(selectedCountyAtom);
  const [search, setSearch] = useAtom(searchAtom);
  const [flowType, setFlowType] = useAtom(flowTypeAtom);
  const [foodGroup, setFoodGroup] = useAtom(foodGroupAtom);
  const [countyHiglighted, setCountyHighlighted] = useAtom(
    countyHighlightedAtom
  );

  const onFoodGroupClick = useCallback(
    (category: Category) => {
      setFoodGroup(foodGroup === category ? null : category);
    },
    [foodGroup, setFoodGroup]
  );

  const { data: flowsData, error, isLoading } = useFlowsData();
  const { data: countyData, isLoading: isCountyLoading } = useCountyData();

  const totalPopulation = useMemo(() => {
    if (!countyData) return null;
    const pop = countyData.properties.total_population;
    if (pop < 1000000) {
      return {
        pop: new Intl.NumberFormat("en-US").format(pop),
        unit: null,
      };
    }
    return {
      pop: new Intl.NumberFormat("en-US", {
        maximumSignificantDigits: 3,
      }).format(pop / 1000000),
      unit: "million",
    };
  }, [countyData]);

  const stats = useMemo(() => {
    if (!flowsData) return null;
    return getStats(flowsData.stats.byCropGroup, flowsData.stats.byCrop);
  }, [flowsData]);

  const topLinkedCountries = useLinkedCounties()

  const CropsTotalPanel = () => {
    if (!stats || isLoading)
      return (
        <dt>Calories {flowType === "consumer" ? "consumed" : "produced"}:</dt>
      );

    if (stats.total === 0) {
      return (
        <dt>
          No crops were {flowType === "consumer" ? "consumed" : "produced"} by
          this county.
        </dt>
      );
    }

    return (
      <>
        <dt>Calories {flowType === "consumer" ? "consumed" : "produced"}:</dt>
        <dd>
          <b>~{stats?.formattedTotal}</b> million kcal
        </dd>
      </>
    );
  };

  return (
    <div
      className={classNames(styles.flowInfo, { [styles.loading]: isLoading })}
    >
      <div className={styles.logoWrapper}>
        <Logo />
      </div>

      {!search && (
        <>
          <nav>
            <button onClick={() => setSearch(true)}>
              <span>Search county</span>
              <h2>
                {selectedCounty?.properties.name},{" "}
                {selectedCounty?.properties.stusps}
              </h2>
            </button>

            <div className={styles.tabBar}>
              <button
                onClick={() => setFlowType("producer")}
                className={cx(styles.producer, {
                  [styles.selected]: flowType === "producer",
                })}
              >
                Producer
              </button>
              <button
                onClick={() => setFlowType("consumer")}
                className={cx(styles.consumer, {
                  [styles.selected]: flowType === "consumer",
                })}
              >
                Consumer
              </button>
            </div>
          </nav>
          <div className={styles.content}>
            <div className={styles.summary}>
              <dl>
                <dt>Population:</dt>
                <dd>
                  <b>{totalPopulation?.pop}</b> {totalPopulation?.unit}
                </dd>
              </dl>
              <dl>
                <CropsTotalPanel />
              </dl>
            </div>
            {stats && stats.total > 0 && (
              <div className={styles.stats}>
                <h3>
                  Main crops {flowType === "consumer" ? "consumed" : "produced"}
                  :
                </h3>
                <ul className={styles.crops}>
                  {CATEGORIES.map((category) => {
                    if (!isLoading && !stats?.byCropGroup[category]) {
                      return null;
                    }
                    return (
                      <li
                        key={category}
                        onClick={() => onFoodGroupClick(category)}
                        style={
                          {
                            "--color": CATEGORIES_PROPS[category].color,
                            "--width": `${
                              stats?.byCropGroup[category]?.value || 0
                            }%`,
                          } as React.CSSProperties
                        }
                      >
                        <dl>
                          <dt>{CATEGORIES_PROPS[category].name}</dt>
                          <dd>{stats?.byCropGroup[category]?.value}%</dd>
                        </dl>
                        {foodGroup === category && (
                          <ul className={styles.detail}>
                            {stats?.byCrop[category].map(([name, value]) => (
                              <li key={name}>
                                <dl>
                                  <dt>{name}</dt>
                                  <dd>{value}%</dd>
                                </dl>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            {!!topLinkedCountries?.length && (
              <div className={styles.top}>
                <h3>
                  Top {flowType === "consumer" ? "sourcing" : "destination"}{" "}
                  counties{" "}
                </h3>
                <ol>
                  {topLinkedCountries.map((county: Feature<Geometry, County>) => (
                    <li
                    // TODO highlight on hover
                      onMouseOver={() => setCountyHighlighted(county.properties.geoid)}
                      onMouseOut={() => setCountyHighlighted(null)}
                      key={county.properties.geoid}
                    >
                      {county.properties.name}, {county.properties.stusps}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default FlowInfo;
