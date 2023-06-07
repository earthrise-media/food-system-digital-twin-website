import React, { useCallback } from "react";
import styles from "@/styles/FlowInfo.module.css";
import { CATEGORIES, CATEGORIES_PROPS } from "@/constants";
import cx from "classnames";
import { useAtom, useAtomValue } from "jotai";
import Logo from "./_logo";
import { flowTypeAtom, searchAtom, foodGroupAtom, selectedCountyAtom } from "@/atoms";
import { Category } from "@/types";
import { useFlowsData } from "@/hooks/useAPI";

type FlowInfoProps = {};

function FlowInfo({}: FlowInfoProps) {
  const selectedCounty = useAtomValue(selectedCountyAtom)
  const [search, setSearch] = useAtom(searchAtom);
  const [flowType, setFlowType] = useAtom(flowTypeAtom);
  const [foodGroup, setFoodGroup] = useAtom(foodGroupAtom);

  const onFoodGroupClick = useCallback((category: Category) => {
    setFoodGroup(foodGroup === category ? null : category);
  }, [foodGroup, setFoodGroup]);

  const {
    data: flowsData,
    error,
    isLoading,
  } = useFlowsData()


  console.log(flowsData)

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
                        "--width": `${Math.random()*100}%`,
                      } as React.CSSProperties
                    }
                  >
                    <dl>
                      <dt>{ CATEGORIES_PROPS[category].name}</dt>
                      <dd>20%</dd>
                    </dl>
                    {foodGroup === category && (
                         <ul className={styles.detail}>
                         <li>
                           <dl>
                             <dt>Apples</dt>
                             <dd>18.9%</dd>
                           </dl>
                         </li>
                         <li>
                           <dl>
                             <dt>Stone fruits</dt>
                             <dd>18.9%</dd>
                           </dl>
                         </li>
                         <li>
                           <dl>
                             <dt>Berries</dt>
                             <dd>18.9%</dd>
                           </dl>
                         </li>
                         <li>
                           <dl>
                             <dt>Grapes</dt>
                             <dd>18.9%</dd>
                           </dl>
                         </li>
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
