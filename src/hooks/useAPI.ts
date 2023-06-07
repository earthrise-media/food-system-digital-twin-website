import { useAtomValue } from "jotai";
import useSWR from "swr";
import { fetcher} from "@/utils";
import { flowTypeAtom, selectedCountyAtom } from "@/atoms";
import { RawFlowsInbound, RawFlowsOutbound } from "@/types";

export function useFlowsData() {
  const selectedCounty = useAtomValue(selectedCountyAtom)
  const flowType = useAtomValue(flowTypeAtom);
  const direction = flowType === 'consumer' ? 'inbound' : 'outbound';
  return useSWR<RawFlowsInbound | RawFlowsOutbound>(
    `/api/county/${selectedCounty?.properties.geoid}/${direction}`,
    fetcher
  );
}

export function useCountyData() {
  const selectedCounty = useAtomValue(selectedCountyAtom)
  return useSWR<{ properties: Record<string, any>}>(
    `/api/county/${selectedCounty?.properties.geoid}`,
    fetcher
  );
}