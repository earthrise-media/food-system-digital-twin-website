import { useMemo } from "react";
import { useFlowsData } from "./useAPI";
import { useAtomValue } from "jotai";
import { countiesAtom, flowTypeAtom } from "@/atoms";
import { RawFlows } from "@/types";


export function useLinkedFlows() {
  const { data: flowsData, isLoading } = useFlowsData();
  const flowType = useAtomValue(flowTypeAtom);

  return useMemo(() => {
    if (!flowsData) return { isLoading, flows: [] };
    return { isLoading, flows: (flowsData as RawFlows).inbound || (flowsData as RawFlows).outbound };
  }, [flowsData, isLoading]);
}

export default function useLinkedCounties() {
  const counties = useAtomValue(countiesAtom);
  const { flows: linkedFlows, isLoading } = useLinkedFlows();

  return useMemo(() => {
    if (!counties) return { isLoading, linkedCounties: [] };
    const linkedCountiesIds = linkedFlows.map(
      (c) => c.county_id
    );
    const linkedCounties = counties?.features.filter((c) =>
      linkedCountiesIds.includes(c.properties.geoid)
    );
    return { isLoading, linkedCounties };
  }, [linkedFlows, counties, isLoading]);
}
