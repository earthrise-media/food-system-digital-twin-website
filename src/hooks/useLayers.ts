import { useMemo } from "react";
import { GeoJsonLayer } from "@deck.gl/layers/typed";
import { FeatureCollection, Geometry, Feature } from "geojson";
import { County, LinkWithPaths } from "@/types";
import { feature, featureCollection } from "@turf/turf";

export default function useLayers(
  counties: FeatureCollection<Geometry, County>,
  selectedCounty: Feature<Geometry, County> | null,
  links: LinkWithPaths[],
  selectCurrentCountyId: (geoid: string | null) => void
) {
  const linksAsGeoJSON = useMemo(() => {
    if (!links.length) return null;
    const features = links.map((l) => {
      return l.paths.map((coordinates) => feature({
        type: "LineString",
        coordinates
      }))
    }).flat()
    
    return featureCollection(features);
  }, [links])
  console.log(JSON.stringify(linksAsGeoJSON))

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
    if (linksAsGeoJSON) {
      layers.push(
        new GeoJsonLayer({
          id: "lines",
          data: linksAsGeoJSON,
          stroked: true,
          lineWidthUnits: "pixels",
          getLineWidth: 2,
          getLineCOlor: [255, 0, 0, 255],
          // getLineColor: (d: any) => d.properties.color,
          // getLineWidth: (d: any) => d.properties.width,
        })
      );
    }
    return layers;
  }, [counties, selectedCounty, selectCurrentCountyId, linksAsGeoJSON])
  return layers;
}
