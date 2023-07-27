import React, { useMemo } from "react";
import styles from "@/styles/Sidebar.module.css";

import { useAtom, useAtomValue } from "jotai";
import Logo from "../_logo";
import { flowTypeAtom, searchAtom, selectedCountyAtom } from "@/atoms";
import { useFlowsData } from "@/hooks/useAPI";
import classNames from "classnames";
import { getStats, Stats } from "@/utils";
import Summary from "./_summary";
import Crops from "./_crops";
import CountiesList from "./_countiesList";
import Roads from "./_roads";
import Drought from "./_drought";
import Tabs from "./_tabs";
import SentenceCounty from "./_sentenceCounty";

type FlowInfoProps = {};

function FlowInfo({}: FlowInfoProps) {
  const selectedCounty = useAtomValue(selectedCountyAtom);
  const [search, setSearch] = useAtom(searchAtom);
  const flowType = useAtomValue(flowTypeAtom);
  const { data: flowsData, error, isLoading } = useFlowsData();

  const stats: Stats | null = useMemo(() => {
    if (!flowsData) return null;
    return getStats(flowsData.stats.byCropGroup, flowsData.stats.byCrop);
  }, [flowsData]);

  return (
    <div
      className={classNames(styles.flowInfo, { [styles.loading]: isLoading })}
    >
      <div className={styles.logoWrapper}>
        <Logo />
      </div>

      {!search && (
        <>
          <nav>
            <button onClick={() => setSearch(true)}>
              <span>Search county</span>
              <h2>
                {selectedCounty?.properties.name},{" "}
                {selectedCounty?.properties.stusps}
              </h2>
            </button>

            <Tabs />
          </nav>
          <div className={styles.content}>
            <section>
              <h3>Crops {flowType === "consumer" ? "consumed" : "produced"}</h3>
              <div className={styles.summary}>
                <Summary stats={stats} />
              </div>
              <SentenceCounty stats={stats} selectedCounty={selectedCounty} rank={flowsData?.rank} topCrop={flowsData?.topCrop} />
              <div className={styles.crops}>
                <Crops stats={stats} />
              </div>

              {/* {flowType === "producer" && <Drought />} */}
            </section>
            <section>
              <h3>
                {flowType === "consumer" ? "Sourcing" : "Destination"} counties{" "}
              </h3>
              <CountiesList />
              <Roads />
            </section>
          </div>
        </>
      )}
    </div>
  );
}

export default FlowInfo;
