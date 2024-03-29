import React, { useMemo } from "react";
import styles from "@/styles/Sidebar.module.css";

import { useAtom, useAtomValue } from "jotai";
import {
  aboutAtom,
  flowTypeAtom,
  searchAtom,
  selectedCountyAtom,
} from "@/atoms";
import { useFlowsData } from "@/hooks/useAPI";
import { getStats, Stats } from "@/utils";
import Summary from "./_summary";
import Crops from "./_crops";
import CountiesList from "./_countiesList";
import FlowTypeTabs from "./_flowTypeTabs";
import { useHideable } from "@/hooks/useHideable";
import { SIDEBAR_WIDTH } from "@/constants";
import LineLoader from "../common/_loader";

type FlowInfoProps = {};

function FlowInfo({}: FlowInfoProps) {
  const selectedCounty = useAtomValue(selectedCountyAtom);
  const flowType = useAtomValue(flowTypeAtom);
  const { data: flowsData, error, isLoading } = useFlowsData();

  const [search, setSearch] = useAtom(searchAtom);
  const about = useAtomValue(aboutAtom);
  const { className, style, shouldMount } = useHideable(
    !search && !about,
    styles.flowInfo,
    styles.hidden
  );

  const stats: Stats | null = useMemo(() => {
    if (!flowsData) return null;
    return getStats(flowsData.stats.byCropGroup, flowsData.stats.byCrop);
  }, [flowsData]);

  return (
    <div
      className={className}
      style={
        { ...style, "--width": `${SIDEBAR_WIDTH}px` } as React.CSSProperties
      }
    >
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
            {stats?.total === 0 ? (
              <section className={styles.noCrops}>
                {isLoading ? (
                  <LineLoader width={320} />
                ) : (
                  <>
                    According to the data available, no crops are produced in
                    this county.
                  </>
                )}
              </section>
            ) : (
              <>
                <section>
                  <h3>
                    Crops {flowType === "consumer" ? "consumed" : "produced"}
                  </h3>
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
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default FlowInfo;
