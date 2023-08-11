import { CATEGORIES, CATEGORIES_PROPS } from "@/constants";
import { Stats } from "@/utils";
import styles from "@/styles/Crops.module.css";
import { useAtom, useAtomValue } from "jotai";
import { adverseConditionsAtom, foodGroupAtom } from "@/atoms";
import { useCallback } from "react";
import { Category } from "@/types";
import { useFlowsData } from "@/hooks/useAPI";
import classNames from "classnames";
import { useHideable } from "@/hooks/useHideable";
import LineLoader from "../common/_loader";

function Crop({
  category,
  stats,
}: {
  category: Category;
  stats: Stats | null;
}) {
  const { isLoading } = useFlowsData();
  const [foodGroup, setFoodGroup] = useAtom(foodGroupAtom);
  const onFoodGroupClick = useCallback(
    (category: Category) => {
      setFoodGroup(foodGroup === category ? null : category);
    },
    [foodGroup, setFoodGroup]
  );
  const adverseConditions = useAtomValue(adverseConditionsAtom);
  const pct = stats?.byCropGroup[category]?.pct;
  const relAdverse = adverseConditions
    ? stats?.byCropGroup[category]?.[
        adverseConditions === "drought" ? "pct_drought" : "pct_heat_stress"
      ]
    : 0;
  const varAdverse = adverseConditions
    ? stats?.byCropGroup[category]?.[
        adverseConditions === "drought" ? "var_drought" : "var_heat_stress"
      ]
    : 0;
  const widthForeground = (adverseConditions ? relAdverse : pct) || 0;
  const widthBackground = pct || 0;

  const { className, style } = useHideable(
    !!stats?.byCropGroup[category],
    "",
    styles.hidden
  );

  const negative = varAdverse !== undefined && varAdverse < 0;

  return (
    <li
      key={category}
      onClick={() => onFoodGroupClick(category)}
      className={className}
      style={
        {
          ...style,
          "--color": CATEGORIES_PROPS[category].color,
          "--widthForeground": `${widthForeground}%`,
          "--widthBackground": `${widthBackground}%`,
        } as React.CSSProperties
      }
    >
      <dl>
        <dt>{CATEGORIES_PROPS[category].name}</dt>
        <dd>
          {isLoading ? (
            <LineLoader width={30} height={12} />
          ) : (
            <>
              {pct}%
              {adverseConditions && (
                <span
                  className={classNames(styles.variation, {
                    [styles.negative]: negative,
                    [styles.equal]: !negative,
                  })}
                >
                  {negative ? '' : '+'}{varAdverse}%
                </span>
              )}
            </>
          )}{" "}
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
}

export default function Crops({ stats }: { stats: Stats | null }) {
  const adverseConditions = useAtomValue(adverseConditionsAtom);

  return (
    <>
      <ul
        className={classNames(styles.crops, {
          [styles.showBackground]: adverseConditions,
        })}
      >
        {CATEGORIES.map((category) => (
          <Crop key={category} stats={stats} category={category} />
        ))}
      </ul>
    </>
  );
}
