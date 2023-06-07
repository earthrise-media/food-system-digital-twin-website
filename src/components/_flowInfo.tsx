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
import { useFlowsData } from "@/hooks/useAPI";

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

  const stats = useMemo(() => {
    if (!flowsData) return null;
    const total = flowsData.stats.byCropGroup.reduce(
      (acc, curr) => acc + curr.value,
      0
    );

    const byCropGroup = Object.fromEntries(
      flowsData.stats.byCropGroup.map(({ value, ...rest }) => [
        rest.crop_category,
        {
          value: Math.round((value / total) * 1000) / 10,
          ...rest,
        },
      ])
    );

    const byCropDict = flowsData.stats.byCrop.reduce((acc, curr) => {
      const category = curr.crop_category;
      if (!acc[category]) {
        acc[category] = {};
      }
      if (!acc[category][curr.crop_name!]) {
        acc[category][curr.crop_name!] = 0;
      }
      acc[category][curr.crop_name!] +=
        Math.round((curr.value / total) * 1000) / 10;
      return acc;
    }, {} as Record<Category, Record<string, number>>);

    const byCrop = Object.fromEntries(
      Object.entries(byCropDict).map(([category, crops]) => {
        const sortedCrops = Object.entries(crops).sort((a, b) => b[1] - a[1]);
        return [category, sortedCrops];
      })
    );

    return {
      total,
      byCropGroup,
      byCrop,
    };
  }, [flowsData]);

  return (
    <div className={styles.flowInfo}>
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
                  <b>8.773</b> million
                </dd>
              </dl>
              <dl>
                <dt>Calories consumed:</dt>
                <dd>
                  <b>~323,234</b> kcal
                </dd>
              </dl>
            </div>
            <div className={styles.stats}>
              <h3>Main crops consumed:</h3>
              <ul className={styles.crops}>
                {CATEGORIES.map((category) => (
                  <li
                    key={category}
                    onClick={() => onFoodGroupClick(category)}
                    style={
                      {
                        "--color": CATEGORIES_PROPS[category].color,
                        "--width": `${stats?.byCropGroup[category].value}%`,
                      } as React.CSSProperties
                    }
                  >
                    <dl>
                      <dt>{CATEGORIES_PROPS[category].name}</dt>
                      <dd>{stats?.byCropGroup[category].value}%</dd>
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
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default FlowInfo;
