import { useMemo } from "react";
import { useAtomValue } from "jotai";
import { countiesAtom, countyAtom } from "@/atoms";

export default function useSelectedCounty() {
  const currentCountyId = useAtomValue(countyAtom);
  const counties = useAtomValue(countiesAtom);
  const selectedCounty = useMemo(() => {
    if (!currentCountyId || !counties) return;
    return counties.features.find(
      (county) => county.properties.geoid === currentCountyId
    );
  }, [currentCountyId, counties]);
  return selectedCounty;
}
