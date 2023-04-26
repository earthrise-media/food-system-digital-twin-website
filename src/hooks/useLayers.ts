import { useMemo } from "react";
import { GeoJsonLayer } from "@deck.gl/layers/typed";
import { FeatureCollection, Geometry, Feature } from "geojson";
import { County } from "@/types";

export default function useLayers(
  counties:FeatureCollection<Geometry, County>,
  selectedCounty: Feature<Geometry, County> | null,
  links: any,
  selectCurrentCountyId: (geoid: string | null) => void
) {
  const layers = useMemo(() => {
    const layers: GeoJsonLayer[] = [
      new GeoJsonLayer({
        id: "counties",
        data: counties,
        stroked: true,
        filled: true,
        getFillColor: [0, 0, 0, 0],
        getLineColor: [246, 243, 239, 255],
        lineWidthScale: 5000,
        lineWidthMinPixels: 1,
        getLineWidth: 1,
        onClick: ({ object }) => selectCurrentCountyId(object.properties.geoid),
        pickable: true,
      }),
      new GeoJsonLayer({
        id: "counties-selected",
        data: [selectedCounty],
        stroked: true,
        filled: true,
        getFillColor: [0, 0, 0, 122],
        getLineColor: [0, 0, 0, 255],
        lineWidthScale: 5000,
        lineWidthMinPixels: 1,
        getLineWidth: 1,
      }),
    ];
    return layers;
  }, [counties, selectedCounty, selectCurrentCountyId]);
  return layers;
}
