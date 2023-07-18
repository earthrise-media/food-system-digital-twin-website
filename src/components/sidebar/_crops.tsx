import { CATEGORIES, CATEGORIES_PROPS } from "@/constants";
import { Stats } from "@/utils";
import styles from "@/styles/Crops.module.css";
import { useAtom, useAtomValue } from "jotai";
import { flowTypeAtom, foodGroupAtom } from "@/atoms";
import { useCallback } from "react";
import { Category } from "@/types";
import { useFlowsData } from "@/hooks/useAPI";

export default function Crops({ stats }: { stats: Stats | null }) {
  const { isLoading } = useFlowsData();
  const [foodGroup, setFoodGroup] = useAtom(foodGroupAtom);
  const onFoodGroupClick = useCallback(
    (category: Category) => {
      setFoodGroup(foodGroup === category ? null : category);
    },
    [foodGroup, setFoodGroup]
  );

  return (
    <>
      {stats && stats.total > 0 && (
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
                    "--width": `${stats?.byCropGroup[category]?.value || 0}%`,
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
      )}
    </>
  );
}
