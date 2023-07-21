import { flowTypeAtom } from "@/atoms";
import { NUM_COUNTIES } from "@/constants";
import { County } from "@/types";
import { Stats } from "@/utils";
import { Feature, Geometry } from "geojson";
import { useAtom, useAtomValue } from "jotai";

export default function SentenceCounty({
  stats,
  rank,
  selectedCounty,
  topCrop,
}: {
  stats: Stats | null;
  rank: number;
  selectedCounty?: Feature<Geometry, County>;
  topCrop: any
}) {
  const flowsType = useAtomValue(flowTypeAtom);
  // console.log(stats)
  return (
    <p>
      {selectedCounty?.properties.name} is one of the top/average/bottom{" "}
      {flowsType === "consumer" ? "consuming" : "producing"} counties in the US,
      ranking at rank {rank} / {NUM_COUNTIES}. It is the largest {flowsType} of{" "}
      {topCrop?.name} ({topCrop?.rank}th overall), which represent percentage of its inflows/outflows.
    </p>
  );
}
