import styles from "@/styles/Summary.module.css";
import { useMemo } from "react";
import { Stats } from "@/utils";
import { useCountyData, useFlowsData } from "@/hooks/useAPI";
import { useAtomValue } from "jotai";
import { flowTypeAtom } from "@/atoms";

export default function Stats({ stats }: { stats: Stats | null } ) {
  const CropsTotalPanel = () => {
    if (!stats || isLoading)
      return (
        <dt>Calories {flowType === "consumer" ? "consumed" : "produced"}:</dt>
      );
  
    if (stats.total === 0) {
      return (
        <dt>
          No crops were {flowType === "consumer" ? "consumed" : "produced"} by
          this county.
        </dt>
      );
    }
  
    return (
      <>
        <dt>Calories {flowType === "consumer" ? "consumed" : "produced"}:</dt>
        <dd>
          <b>~{stats?.formattedTotal}</b> million kcal
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
          <b>{totalPopulation?.pop}</b> {totalPopulation?.unit}
        </dd>
      </dl>
      <dl>
        <CropsTotalPanel />
      </dl>
    </div>
  );
}
