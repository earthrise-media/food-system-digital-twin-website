import React, { useMemo } from "react";
import styles from "@/styles/Sidebar.module.css";

import { useAtom, useAtomValue } from "jotai";
import Logo from "../_logo";
import { flowTypeAtom, searchAtom, selectedCountyAtom } from "@/atoms";
import { useFlowsData } from "@/hooks/useAPI";
import { getStats, Stats } from "@/utils";
import Summary from "./_summary";
import Crops from "./_crops";
import CountiesList from "./_countiesList";
import FlowTypeTabs from "./_flowTypeTabs";
import { useHideable } from "@/hooks/useHideable";

type FlowInfoProps = {};

function FlowInfo({}: FlowInfoProps) {
  const selectedCounty = useAtomValue(selectedCountyAtom);
  const flowType = useAtomValue(flowTypeAtom);
  const { data: flowsData, error, isLoading } = useFlowsData();

  const [search, setSearch] = useAtom(searchAtom);
  const { className, style, shouldMount } = useHideable(
    !search,
    styles.flowInfo,
    styles.hidden
  );

  const stats: Stats | null = useMemo(() => {
    if (!flowsData) return null;
    return getStats(flowsData.stats.byCropGroup, flowsData.stats.byCrop);
  }, [flowsData]);

  return (
    <div className={className} style={style}>
      <div className={styles.logoWrapper}>
        <Logo />
      </div>

      {shouldMount && (
        <>
          <nav>
            <button onClick={() => setSearch(true)}>
              <span>Search county</span>
              <h2>
                {selectedCounty?.properties.name},{" "}
                {selectedCounty?.properties.stusps}
              </h2>
            </button>

            <FlowTypeTabs />
          </nav>
          <div className={styles.content}>
            <section>
              <h3>Crops {flowType === "consumer" ? "consumed" : "produced"}</h3>
              <div className={styles.summary}>
                <Summary stats={stats} />
              </div>

              {!!stats?.total && (
                <div className={styles.crops}>
                  <Crops stats={stats} />
                </div>
              )}
            </section>
            {!!stats?.total && (
              <section>
                <CountiesList
                  title={
                    flowType === "consumer"
                      ? "Sourcing counties"
                      : "Destination counties"
                  }
                />
              </section>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default FlowInfo;
