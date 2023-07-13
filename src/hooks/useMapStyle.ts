import { Flow } from "@/types";
import { featureCollection } from "@turf/helpers";
import { Feature, LineString } from "geojson";
import { Style } from "mapbox-gl";
import { feature } from "turf";

export default function useMapStyle(
  initialMapStyle: Style,
  flows: Flow[] = []
):Style {
  const routes = flows
    .filter((flow) => flow.routeGeometry)
    .map((flow) => feature(flow.routeGeometry as Feature<LineString>));

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
