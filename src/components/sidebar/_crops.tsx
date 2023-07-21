import { CATEGORIES, CATEGORIES_PROPS } from "@/constants";
import { Stats } from "@/utils";
import styles from "@/styles/Crops.module.css";
import { useAtom, useAtomValue } from "jotai";
import { adverseConditionsAtom, foodGroupAtom } from "@/atoms";
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
        <ul
          className={classNames(styles.crops, {
            [styles.showBackground]: adverseConditions,
          })}
        >
          {CATEGORIES.map((category) => {
            if (!isLoading && !stats?.byCropGroup[category]) {
              return null;
            }
            const pct = stats?.byCropGroup[category]?.pct;
            const pctAdverse = adverseConditions
              ? stats?.byCropGroup[category]?.[
                  adverseConditions === "drought"
                    ? "pct_drought"
                    : "pct_heat_stress"
                ]
              : 0;
            const widthForeground = (adverseConditions ? pctAdverse : pct) || 0;
            const widthBackground = pct || 0;

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
                  <dd>
                    {pct}%
                    <span
                      className={classNames(styles.variation, {
                        [styles.negative]: pct - pctAdverse > 1,
                        [styles.equal]: pct - pctAdverse <= 1,
                      })}
                    >
                      {pctAdverse}%
                    </span>
                  </dd>
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
