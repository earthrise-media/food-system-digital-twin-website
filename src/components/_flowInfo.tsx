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
} from "@/atoms";
import { Category } from "@/types";
import { useCountyData, useFlowsData } from "@/hooks/useAPI";
import classNames from "classnames";
import { getStats } from "@/utils";

type FlowInfoProps = {};

function FlowInfo({}: FlowInfoProps) {
  const selectedCounty = useAtomValue(selectedCountyAtom);
  const [search, setSearch] = useAtom(searchAtom);
  const [flowType, setFlowType] = useAtom(flowTypeAtom);
  const [foodGroup, setFoodGroup] = useAtom(foodGroupAtom);

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
                onClick={() => setFlowType("consumer")}
                className={cx(styles.consumer, {
                  [styles.selected]: flowType === "consumer",
                })}
              >
                Consumer
              </button>
              <button
                onClick={() => setFlowType("producer")}
                className={cx(styles.producer, {
                  [styles.selected]: flowType === "producer",
                })}
              >
                Producer
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
                <dt>Calories consumed:</dt>
                <dd>
                  {stats?.formattedTotal && (
                    <>
                      <b>~{stats?.formattedTotal}</b> million kcal
                    </>
                  )}
                </dd>
              </dl>
            </div>
            <div className={styles.stats}>
              <h3>
                Main crops {flowType === "consumer" ? "consumed" : "produced"}:
              </h3>
              <ul className={styles.crops}>
                {CATEGORIES.map((category) => {
                  if (!isLoading && !stats?.byCropGroup[category]) {
                    return null
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
          </div>
        </>
      )}
    </div>
  );
}

export default FlowInfo;
