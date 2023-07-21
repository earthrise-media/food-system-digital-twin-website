import styles from "@/styles/Summary.module.css";
import { useMemo, useState } from "react";
import { Stats } from "@/utils";
import { useCountyData, useFlowsData } from "@/hooks/useAPI";
import { useAtomValue } from "jotai";
import { flowTypeAtom } from "@/atoms";

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

  return (
    <div className={styles.summary}>
      {stats?.total === 0 && (
        <dl>
          <dt>
            No crops were {flowType === "consumer" ? "consumed" : "produced"} by
            this county.
          </dt>
        </dl>
      )}
      {!!stats?.total && stats?.total > 0 && (
        <dl>
          <dt>Calories {flowType === "consumer" ? "consumed" : "produced"}:</dt>
          <dd>
            <b>
              ~{stats?.formattedTotal.value}
              {stats?.formattedTotal.unit}
            </b>{" "}
            Cal
          </dd>
        </dl>
      )}

      {flowType === "consumer" && (
        <dl
          className={styles.toggleDisplay}
          onClick={() => setDisplayPerCapita(!displayPerCapita)}
        >
          {displayPerCapita ? (
            <>
              <dt>Calories per capita:</dt>
              <dd>
                <b>~{calPerCapita}</b> Cal
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
            <b>{countyData?.properties.agriculture_sector_gdp || '?'} %</b>
          </dd>
        </dl>
      )}
    </div>
  );
}
