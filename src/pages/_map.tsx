import React, { useMemo, useState } from "react";
import DeckGL from "@deck.gl/react/typed";
import { Map } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { FeatureCollection, Geometry } from "geojson";
import useLayers from "@/hooks/useLayers";
import { County } from "@/types";
import useLinks, {
  useLinksWithCurvedPaths,
  useLinksWithTrips,
} from "@/hooks/useLinks";

const INITIAL_VIEW_STATE = {
  longitude: -98,
  latitude: 37,
  zoom: 4,
  pitch: 30,
  bearing: 0,
};
type MapWrapperProps = {
  counties: FeatureCollection<Geometry, County>;
  links: Record<string, number>[];
};

function MapWrapper({ counties, links }: MapWrapperProps) {
  const [currentCountyId, selectCurrentCountyId] = useState<string | null>(
    null
  );

  const selectedCounty = useMemo(() => {
    if (!currentCountyId) return null;
    return (
      counties.features.find(
        (county) => county.properties.geoid === currentCountyId
      ) || null
    );
  }, [currentCountyId, counties]);

  const selectedLinks = useLinks(selectedCounty, counties, links);

  const linksWithCurvedPaths = useLinksWithCurvedPaths(selectedLinks);

  const linksWithTrips = useLinksWithTrips(linksWithCurvedPaths);

  const targetCounties = linksWithTrips.flatMap((l) => {
    const target = counties.features.find(
      (county) => county.properties.geoid === l.targetId
    );
    return target ? [target] : []
  });

  const layers = useLayers(
    counties,
    selectedCounty,
    targetCounties,
    linksWithTrips,
    selectCurrentCountyId
  );

  return (
    <DeckGL
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      layers={layers}
    >
      <Map
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        mapStyle="mapbox://styles/fausto-perez/clgnkv1d000dl01qucf7wc8zc"
      />
    </DeckGL>
  );
}

export default MapWrapper;
