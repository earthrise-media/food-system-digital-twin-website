import { useMemo } from "react";
import { useFlowsData } from "./useAPI";
import { useAtomValue } from "jotai";
import { countiesAtom, flowTypeAtom } from "@/atoms";
import { RawFlows } from "@/types";


export function useLinkedFlows() {
  const { data: flowsData } = useFlowsData();
  const flowType = useAtomValue(flowTypeAtom);

  return useMemo(() => {
    if (!flowsData) return null;
    const type = flowType === "consumer" ? "inbound" : "outbound";
    return (flowsData as RawFlows)[type]
  }, [flowsData, flowType]);
}

export default function useLinkedCounties() {
  const counties = useAtomValue(countiesAtom);
  const linkedFlows = useLinkedFlows();

  return useMemo(() => {
    if (!linkedFlows || !counties) return null;
    const linkedCountiesIds = linkedFlows.map(
      (c) => c.county_id
    );
    const linkedCounties = counties?.features.filter((c) =>
      linkedCountiesIds.includes(c.properties.geoid)
    );
    return linkedCounties;
  }, [linkedFlows, counties]);
}
