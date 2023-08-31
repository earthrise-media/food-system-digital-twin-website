import { adverseConditionsAtom, roadsAtom, searchAtom } from "@/atoms";
import { ADVERSE_CONDITIONS_OPTIONS, STRESS_PALETTE } from "@/constants";
import { Flow } from "@/types";
import { featureCollection } from "@turf/helpers";
import { useAtomValue } from "jotai";
import { Style } from "mapbox-gl";
import { feature } from "turf";
import { useControls } from "leva";

export default function useMapStyle(
  initialMapStyle: Style,
  flows: Flow[] = []
): Style {
  const roads = useAtomValue(roadsAtom);
  const stress = useAtomValue(adverseConditionsAtom);
  const { color0, color1, color2, color3, color4, stressOpacity } = useControls(
    "stress color scale",
    {
      color0: STRESS_PALETTE[0],
      color1: STRESS_PALETTE[1],
      color2: STRESS_PALETTE[2],
      color3: STRESS_PALETTE[3],
      color4: STRESS_PALETTE[4],
      stressOpacity: 0.8,
    }
  );

  const sources = {
    ...initialMapStyle.sources,
  };

  let layers = [...initialMapStyle.layers];

  if (stress !== null) {
    const option = ADVERSE_CONDITIONS_OPTIONS.find(
      (option) => option.value === stress
    );
    const tilesUrl = option?.tilesUrl;

    const steps =
      stress === "drought"
        ? [0, color4, 7, color3, 15, color2, 23, color1, 31, color0]
        : [0, color0, 7, color1, 15, color2, 23, color3, 31, color4];

    sources.stress = {
      type: "raster",
      tiles: [tilesUrl!],
      tileSize: 256,
      scheme: "tms",
    };
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
            ...steps
          ],
          "raster-color-mix": [31, 0, 0, 0],
          "raster-color-range": [0, 31],
          "raster-opacity": stressOpacity,
        } as any,
      },
    ];
  }

  if (roads) {
    const routes = flows
      .filter((flow) => flow.routeGeometry)
      .map((flow) => feature(flow.routeGeometry));

    sources.routes = {
      type: "geojson",
      data: featureCollection(routes),
    };

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
      },
    ];
  }

  const style = {
    ...initialMapStyle,
    sources,
    layers,
  };

  return style as Style;
}
