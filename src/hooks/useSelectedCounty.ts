import { useMemo } from "react";
import { useAtomValue } from "jotai";
import { countiesAtom, countyAtom, countyHighlightedAtom } from "@/atoms";

function useCounty(countyId: string | null) {
  const counties = useAtomValue(countiesAtom);
  return useMemo(() => {
    if (!countyId || !counties) return;
    return counties.features.find(
      (county) => county.properties.geoid === countyId
    );
  }, [countyId, counties]);
}

export default function useSelectedCounty() {
  return useCounty(useAtomValue(countyAtom));
}

export function useHighlightedCounty() {
  return useCounty(useAtomValue(countyHighlightedAtom));
}