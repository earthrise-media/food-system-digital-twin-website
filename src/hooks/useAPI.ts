import { useAtomValue } from "jotai";
import useSWR from "swr";
import { fetcher } from "@/utils";
import { countyAtom, flowTypeAtom, selectedCountyAtom } from "@/atoms";
import { RawFlowsInbound, RawFlowsOutbound } from "@/types";

export function useFlowsData() {
  const selectedCountyId = useAtomValue(countyAtom);
  const flowType = useAtomValue(flowTypeAtom);
  const direction = flowType === "consumer" ? "inbound" : "outbound";
  return useSWR<RawFlowsInbound | RawFlowsOutbound>(
    `/api/county/${selectedCountyId}/${direction}`,
    fetcher,
    {
      keepPreviousData: true,
    }
  );
}

export function useCountyData() {
  const selectedCountyId = useAtomValue(countyAtom);
  return useSWR<{ properties: Record<string, any> }>(
    `/api/county/${selectedCountyId}`,
    fetcher
  );
}
