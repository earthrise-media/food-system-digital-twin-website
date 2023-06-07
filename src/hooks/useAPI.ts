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