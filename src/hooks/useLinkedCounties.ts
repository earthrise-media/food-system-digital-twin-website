import { useMemo } from "react";
import { useFlowsData } from "./useAPI";
import { useAtomValue } from "jotai";
import { countiesAtom, flowTypeAtom } from "@/atoms";
import { County, RawFlows } from "@/types";
import { getStats } from "@/utils";
import { Feature, Geometry } from "geojson";

export function useLinkedFlows() {
  const { data: flowsData, isLoading } = useFlowsData();

  return useMemo(() => {
    if (!flowsData) return { isLoading, flows: [] };
    const flows =
      (flowsData as RawFlows).inbound || (flowsData as RawFlows).outbound;
    const flowsWithStats = flows.map((f) => {
      const { total, byCropGroupCumulative } = getStats(
        f.flowsByCropGroup,
        f.flowsByCrop
      );
      return {
        ...f,
        total,
        byCropGroupCumulative,
      };
    });
    flowsWithStats.sort((a, b) => b.total - a.total);
    return { isLoading, flows: flowsWithStats };
  }, [flowsData, isLoading]);
}

export default function useLinkedCounties() {
  const counties = useAtomValue(countiesAtom);
  const { flows: linkedFlows, isLoading } = useLinkedFlows();

  return useMemo(() => {
    if (!counties) return { isLoading, linkedCounties: [] };

    const linkedCounties = linkedFlows.map((f) => {
      const county = counties.features.find(
        (c) => c.properties?.geoid === f.county_id
      ) as Feature<Geometry, County>;
      return { ...f, ...county };
    });

    return { isLoading, linkedCounties };
  }, [linkedFlows, counties, isLoading]);
}
