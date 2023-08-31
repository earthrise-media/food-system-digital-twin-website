import { useMemo, useState } from "react";

import styles from "@/styles/Summary.module.css";
import { Stats } from "@/utils";
import { useCountyData, useFlowsData } from "@/hooks/useAPI";
import { useAtomValue } from "jotai";
import { adverseConditionsAtom, flowTypeAtom } from "@/atoms";
import LineLoader from "../common/_loader";
import classNames from "classnames";

export default function Stats({ stats }: { stats: Stats | null }) {
  const flowType = useAtomValue(flowTypeAtom);
  const { data: flowsData, error, isLoading } = useFlowsData();
  const { data: countyData, isLoading: isCountyLoading } = useCountyData();
  const adverseConditions = useAtomValue(adverseConditionsAtom);

  const varAdverse = adverseConditions
    ? stats?.[
        adverseConditions === "drought"
          ? "total_drought_var"
          : "total_heat_stress_var"
      ]
    : 0;
  const negative = varAdverse !== undefined && varAdverse < 0;

  const totalPopulation = useMemo(() => {
    if (!countyData) return null;
    const pop = countyData?.properties?.total_population;
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

  const calPerCapita = useMemo(() => {
    if (!countyData || !stats) return null;
    const pop = countyData?.properties?.total_population;
    const perCapita = stats?.total / pop;
    const perCapitaPerdDay = perCapita / 365;
    const perCapitaFormatted = new Intl.NumberFormat("en-US", {
      maximumSignificantDigits: 3,
    }).format(perCapitaPerdDay);
    return perCapitaFormatted;
  }, [countyData, stats]);

  const [displayPerCapita, setDisplayPerCapita] = useState(true);

  const dt =
    stats?.total === 0
      ? `No crops were ${flowType === "consumer" ? "consumed" : "produced"} in
this county.`
      : `Calories ${flowType === "consumer" ? "consumed" : "produced"}:`;

  return (
    <div className={styles.summary}>
      <dl>
        <dt>{dt}</dt>
        <dd>
          {isLoading ? (
            <LineLoader height={24} width={120} />
          ) : (
            <>
              {stats?.total === 0 ? (
                ""
              ) : (
                <>
                  <b>
                    {stats?.formattedTotal.value}
                    {stats?.formattedTotal.unit}
                  </b>{" "}
                  Cal
                  {adverseConditions !== null && (
                    <span
                      className={classNames(styles.variation, {
                        [styles.negative]: negative,
                        [styles.equal]: !negative,
                      })}
                    >
                      {negative ? "" : "+"}
                      {varAdverse}%
                    </span>
                  )}
                </>
              )}
            </>
          )}
        </dd>
      </dl>

      {flowType === "consumer" && (
        <dl
          className={styles.toggleDisplay}
          onClick={() => setDisplayPerCapita(!displayPerCapita)}
        >
          {displayPerCapita ? (
            <>
              <dt>Calories per capita:</dt>
              <dd>
                {isLoading || isCountyLoading ? (
                  <LineLoader height={24} width={120} />
                ) : (
                  <>
                    <b>{calPerCapita}</b> Cal /day
                  </>
                )}
              </dd>
            </>
          ) : (
            <>
              <dt>Population:</dt>
              <dd>
                <b>{totalPopulation?.pop}</b> {totalPopulation?.unit}
              </dd>
            </>
          )}
        </dl>
      )}

      {flowType === "producer" && (
        <dl>
          <dt>Calories per capita:</dt>
          <dd>
            {isLoading || isCountyLoading ? (
              <LineLoader height={24} width={120} />
            ) : (
              <>
                <b>{calPerCapita}</b> Cal /day
              </>
            )}
          </dd>
          {/* <dt>Agriculture sector in GDP</dt>
          <dd>
            <b>{countyData?.properties.agriculture_sector_gdp || "?"} %</b>
          </dd> */}
        </dl>
      )}
    </div>
  );
}
