import { CATEGORIES, CATEGORIES_PROPS } from "@/constants";
import { Stats } from "@/utils";
import styles from "@/styles/Crops.module.css";
import { useAtom, useAtomValue } from "jotai";
import { adverseConditionsAtom, flowTypeAtom, foodGroupAtom } from "@/atoms";
import { useCallback } from "react";
import { Category } from "@/types";
import { useFlowsData } from "@/hooks/useAPI";
import classNames from "classnames";

export default function Crops({ stats }: { stats: Stats | null }) {
  const { isLoading } = useFlowsData();
  const [foodGroup, setFoodGroup] = useAtom(foodGroupAtom);
  const adverseConditions = useAtomValue(adverseConditionsAtom);
  const onFoodGroupClick = useCallback(
    (category: Category) => {
      setFoodGroup(foodGroup === category ? null : category);
    },
    [foodGroup, setFoodGroup]
  );

  return (
    <>
      {stats && stats.total > 0 && (
        <ul className={classNames(styles.crops, { [styles.showBackground]: adverseConditions }) }>
          {CATEGORIES.map((category) => {
            if (!isLoading && !stats?.byCropGroup[category]) {
              return null;
            }
            // console.log(stats?.byCropGroup[category]?.value_drought , stats?.byCropGroup[category]?.value)
            const widthForeground = (adverseConditions ? stats?.byCropGroup[category]?.pct_drought : stats?.byCropGroup[category]?.pct) || 0;
            const widthBackground = stats?.byCropGroup[category]?.pct || 0;

            return (
              <li
                key={category}
                onClick={() => onFoodGroupClick(category)}
                style={
                  {
                    "--color": CATEGORIES_PROPS[category].color,
                    "--widthForeground": `${widthForeground}%`,
                    "--widthBackground": `${widthBackground}%`,
                  } as React.CSSProperties
                }
              >
                <dl>
                  <dt>{CATEGORIES_PROPS[category].name}</dt>
                  <dd>{stats?.byCropGroup[category]?.pct}%</dd>
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
      )}
    </>
  );
}
