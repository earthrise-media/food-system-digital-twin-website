import { useMemo, useState } from "react";

import styles from "@/styles/Summary.module.css";
import { Stats } from "@/utils";
import { useCountyData, useFlowsData } from "@/hooks/useAPI";
import { useAtomValue } from "jotai";
import { flowTypeAtom } from "@/atoms";
import LineLoader from "../common/_loader";

export default function Stats({ stats }: { stats: Stats | null }) {
  const flowType = useAtomValue(flowTypeAtom);
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

  const calPerCapita = useMemo(() => {
    if (!countyData || !stats) return null;
    const pop = countyData.properties.total_population;
    const perCapita = stats?.total / pop;
    const perCapitaFormatted = new Intl.NumberFormat("en-US", {
      maximumSignificantDigits: 3,
    }).format(perCapita);
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
                    ~{stats?.formattedTotal.value}
                    {stats?.formattedTotal.unit}
                  </b>{" "}
                  Cal
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
                    <b>~{calPerCapita}</b> Cal
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
          <dt>Agriculture sector in GDP</dt>
          <dd>
            <b>{countyData?.properties.agriculture_sector_gdp || "?"} %</b>
          </dd>
        </dl>
      )}
    </div>
  );
}
