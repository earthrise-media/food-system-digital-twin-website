import { useMemo } from "react";
import { useFlowsData } from "./useAPI";
import { useAtomValue } from "jotai";
import { countiesAtom, flowTypeAtom } from "@/atoms";
import { RawFlows } from "@/types";

export default function useLinkedCounties() {
  const { data: flowsData } = useFlowsData();
  const counties = useAtomValue(countiesAtom);
  const flowType = useAtomValue(flowTypeAtom);

  return useMemo(() => {
    if (!flowsData || !counties) return null;
    const type = flowType === "consumer" ? "inbound" : "outbound";
    const linkedCountiesIds = (flowsData as RawFlows)[type].map(
      (c) => c.county_id
    );
    const linkedCounties = counties?.features.filter((c) =>
      linkedCountiesIds.includes(c.properties.geoid)
    );
    return linkedCounties;
  }, [flowsData, flowType, counties]);
}
