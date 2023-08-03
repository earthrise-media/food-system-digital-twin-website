import { useMemo } from "react";

import styles from "@/styles/Summary.module.css";
import { Stats } from "@/utils";
import { useCountyData, useFlowsData } from "@/hooks/useAPI";
import { useAtomValue } from "jotai";
import { flowTypeAtom } from "@/atoms";
import LineLoader from "../common/_loader";

export default function Stats({ stats }: { stats: Stats | null }) {
  const CropsTotalPanel = () => {
    const dt =
      stats?.total === 0
        ? `No crops were ${flowType === "consumer" ? "consumed" : "produced"} in
    this county.`
        : `Calories ${flowType === "consumer" ? "consumed" : "produced"}:`;

    return (
      <>
        <dt>{isLoading ? <LineLoader /> : dt}</dt>
        <dd>
          {isLoading ? (
            <LineLoader height={24} width={120} />
          ) : (
            <>
              {stats?.total === 0 ? (
                ""
              ) : (
                <>
                  <b>~{stats?.formattedTotal}</b>{" "}
                  {stats?.total === 0 ? "" : "million"} kcal
                </>
              )}
            </>
          )}
        </dd>
      </>
    );
  };

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

  return (
    <div className={styles.summary}>
      <dl>
        <dt>Population:</dt>
        <dd>
          {isCountyLoading ? (
            <LineLoader height={24} width={80} />
          ) : (
            <>
              <b>{totalPopulation?.pop}</b> {totalPopulation?.unit}
            </>
          )}
        </dd>
      </dl>
      <dl>
        <CropsTotalPanel />
      </dl>
    </div>
  );
}
