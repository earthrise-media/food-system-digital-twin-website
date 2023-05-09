import React, { useCallback, useMemo, useState } from "react";
import { MapboxOverlay, MapboxOverlayProps } from "@deck.gl/mapbox/typed";
import { Map, useControl } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { FeatureCollection, Geometry } from "geojson";
import Popup from "./_popup";
import Search from "./_search";
import "mapbox-gl/dist/mapbox-gl.css";
import useLayers from "@/hooks/useLayers";
import { County } from "@/types";
import useLinks, {
  useLinksWithCurvedPaths,
  useLinksWithTrips,
} from "@/hooks/useLinks";
import { Leva } from "leva";
import useKeyPress from "@/hooks/useKeyPress";

const INITIAL_VIEW_STATE = {
  longitude: -98,
  latitude: 37,
  zoom: 4,
  pitch: 30,
  bearing: 0,
};

function DeckGLOverlay(props: MapboxOverlayProps) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

type MapWrapperProps = {
  counties: FeatureCollection<Geometry, County>;
  links: Record<string, number>[];
};

function MapWrapper({ counties, links }: MapWrapperProps) {
  const [currentCountyId, setCurrentCountyId] = useState<string | null>(null);

  const [searching, setSearching] = useState(false);

  const selectedCounty = useMemo(() => {
    if (!currentCountyId) return;
    return counties.features.find(
      (county) => county.properties.geoid === currentCountyId
    );
  }, [currentCountyId, counties]);

  const selectedLinks = useLinks(counties, links, selectedCounty);

  const linksWithCurvedPaths = useLinksWithCurvedPaths(selectedLinks);

  const linksWithTrips = useLinksWithTrips(linksWithCurvedPaths);

  const targetCounties = linksWithTrips.flatMap((l) => {
    const target = counties.features.find(
      (county) => county.properties.geoid === l.targetId
    );
    return target ? [target] : [];
  });

  const layers = useLayers(
    counties,
    selectedCounty,
    targetCounties,
    linksWithTrips,
    setCurrentCountyId
  );

  const onSearchCounty = useCallback((geoid: string) => {
    setCurrentCountyId(geoid);
    setSearching(false);
  }, []);

  const [uiVisible, setUiVisible] = useState(false);
  const toggleUI = useCallback(() => {
    setUiVisible((v) => !v);
  }, [setUiVisible]);
  useKeyPress("u", toggleUI);

  return (
    <>
      <Map
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        mapStyle="mapbox://styles/fausto-perez/clgnkv1d000dl01qucf7wc8zc"
        initialViewState={INITIAL_VIEW_STATE}
      >
        <DeckGLOverlay layers={layers} />
        <Popup selectedCounty={selectedCounty} />
      </Map>
      <div style={{ position: "absolute" }}>
        <button onClick={() => setSearching(!searching)}>Search county</button>
      </div>
      {searching && (
        <Search counties={counties} onSelectCounty={onSearchCounty} />
      )}
      <Leva oneLineLabels={true} hidden={!uiVisible} />
    </>
  );
}

export default MapWrapper;
