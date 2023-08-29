import { adverseConditionsAtom, roadsAtom, searchAtom } from "@/atoms";
import { STRESS_PALETTE } from "@/constants";
import { Flow } from "@/types";
import { featureCollection } from "@turf/helpers";
import { useAtomValue } from "jotai";
import { Style } from "mapbox-gl";
import { feature } from "turf";

export default function useMapStyle(
  initialMapStyle: Style,
  flows: Flow[] = []
): Style {
  const roads = useAtomValue(roadsAtom);
  const stress = useAtomValue(adverseConditionsAtom);

  const sources = {
    ...initialMapStyle.sources,
  }

  let layers = [
    ...initialMapStyle.layers,
  ]

  if (stress !== null) {
    sources.stress = {
      type: "raster",
      tiles: [
        "https://food-system-digital-twin-public.s3.us-east-2.amazonaws.com/tiles/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      scheme: "tms"
    }
    layers = [
      ...layers,
      {
        id: "cog-layer",
        type: "raster",
        source: "stress",
        paint: {
          "raster-color": [
            "interpolate",
            ["linear"],
            ["raster-value"],
            0,
            STRESS_PALETTE[0],
            7,
            STRESS_PALETTE[1],
            15,
            STRESS_PALETTE[2],
            23,
            STRESS_PALETTE[3],
            31,
            STRESS_PALETTE[4],
          ],
          "raster-color-mix": [31, 0, 0, 0],
          "raster-color-range": [0, 31],
        } as any,
      },
    ]
  }

  if (roads) {
    const routes = flows
    .filter((flow) => flow.routeGeometry)
    .map((flow) => feature(flow.routeGeometry));

    sources.routes = {
      type: "geojson",
      data: featureCollection(routes),
    }

    layers = [
      ...layers,
      {
        id: "routes",
        type: "line",
        source: "routes",
        paint: {
          "line-color": "#ffffff",
          "line-width": 4,
        },
      }
    ]
  }
  
  const style = {
    ...initialMapStyle,
    sources,
    layers
  };

  return style as Style;
}
