import { roadsAtom, searchAtom } from "@/atoms";
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
  const search = useAtomValue(searchAtom);

  if (!roads || !!search) return initialMapStyle;

  const routes = flows
    .filter((flow) => flow.routeGeometry)
    .map((flow) => feature(flow.routeGeometry));

  const style = {
    ...initialMapStyle,
    sources: {
      ...initialMapStyle.sources,
      routes: {
        type: "geojson",
        data: featureCollection(routes),
      },
    },
    layers: [
      ...initialMapStyle.layers,
      {
        id: "routes",
        type: "line",
        source: "routes",
        paint: {
          "line-color": "#ff0000",
          "line-width": 2,
        },
      },
    ],
  };
  return style as Style;
}
