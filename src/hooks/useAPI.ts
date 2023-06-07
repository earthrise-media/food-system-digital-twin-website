import { useAtomValue } from "jotai";
import useSWR from "swr";
import { fetcher} from "@/utils";
import { flowTypeAtom, selectedCountyAtom } from "@/atoms";
import { RawFlows } from "@/types";

export function useFlowsData() {
  const selectedCounty = useAtomValue(selectedCountyAtom)
  const flowType = useAtomValue(flowTypeAtom);
  const direction = flowType === 'consumer' ? 'inbound' : 'outbound';
  return useSWR<RawFlows>(
    `/api/county/${selectedCounty?.properties.geoid}/${direction}`,
    fetcher
  );
}