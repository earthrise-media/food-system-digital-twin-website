import { adverseConditionsAtom, roadsAtom, searchAtom } from "@/atoms";
import { ADVERSE_CONDITIONS_OPTIONS, STRESS_PALETTE } from "@/constants";
import { Flow } from "@/types";
import { featureCollection } from "@turf/helpers";
import { useAtomValue } from "jotai";
import { Style } from "mapbox-gl";
import { feature } from "turf";
import { useControls } from "leva";

export default function useMapStyle(initialMapStyle: Style, flows: Flow[] = []): Style {
  const roads = useAtomValue(roadsAtom);
  const stress = useAtomValue(adverseConditionsAtom);
  const { color0, color1, color2, color3, color4, stressOpacity } = useControls("stress color scale", {
    color0: STRESS_PALETTE[0],
    color1: STRESS_PALETTE[1],
    color2: STRESS_PALETTE[2],
    color3: STRESS_PALETTE[3],
    color4: STRESS_PALETTE[4],
    stressOpacity: 0.6,
  });

  const sources = {
    ...initialMapStyle.sources,
  };

  let layers = [...initialMapStyle.layers];

  if (stress !== null) {
    const option = ADVERSE_CONDITIONS_OPTIONS.find((option) => option.value === stress);
    const tilesUrl = option?.tilesUrl;

    const steps = stress === "drought" ? [-1, color0, -0.5, color1, 0, color2, 0.5, color3, 1, color4] : [-2.839, color0, -0.398, color1, 2.042, color2, 4.483, color3, 6.923, color4];

    const rasterRange = stress === "drought" 
    ? 2
    : 9.762;

    const rasterMin = stress === "drought"
    ? -1
    : -2.839;

    const rasterMax = stress === "drought"
    ? 1
    : 6.923;

    sources.stress = {
      type: "raster",
      tiles: [tilesUrl!],
      tileSize: 256,
      scheme: "tms",
      bounds: [-125.0, 24.0, -66.5, 49.0],
      maxzoom: 8,
    };
    layers = [
      ...layers,
      {
        id: "cog-layer",
        type: "raster",
        source: "stress",
        paint: {
          "raster-color": ["interpolate", ["linear"], ["raster-value"], ...steps],
          "raster-color-mix": [rasterRange, 0, 0, 0],
          "raster-color-range": [rasterMin, rasterMax],
          "raster-opacity": stressOpacity,
        } as any,
      },
    ];
  }

  if (roads) {
    const routes = flows.filter((flow) => flow.routeGeometry).map((flow) => feature(flow.routeGeometry));

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
