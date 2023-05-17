import React, { useCallback, useMemo, useState } from "react";
import { MapboxOverlay, MapboxOverlayProps } from "@deck.gl/mapbox/typed";
import { Map, useControl } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useAtomValue } from "jotai";
import Popup from "./_popup";
import "mapbox-gl/dist/mapbox-gl.css";
import { Style } from "mapbox-gl";
import useLayers from "@/hooks/useLayers";
import useLinks, {
  useLinksWithCurvedPaths,
  useLinksWithTrips,
} from "@/hooks/useLinks";
import { countiesAtom } from "@/atoms";
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
  links: Record<string, number>[];
  mapStyle: Style;
};

function MapWrapper({ links, mapStyle }: MapWrapperProps) {
  const counties = useAtomValue(countiesAtom);
  console.log(links)
  const selectedLinks = useLinks(links);
  const linksWithCurvedPaths = useLinksWithCurvedPaths(selectedLinks);
  const linksWithTrips = useLinksWithTrips(linksWithCurvedPaths);

  const targetCounties = useMemo(() => {
    if (!counties) return [];
    return linksWithTrips.flatMap((l) => {
      const target = counties.features.find(
        (county) => county.properties.geoid === l.targetId
      );
      return target ? [target] : [];
    });
  }, [counties, linksWithTrips]);

  const layers = useLayers(targetCounties, linksWithTrips);

  const [uiVisible, setUiVisible] = useState(false);
  const toggleUI = useCallback(() => {
    setUiVisible((v) => !v);
  }, [setUiVisible]);
  useKeyPress("u", toggleUI);

  return (
    <>
      <Map
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        mapStyle={mapStyle}
        initialViewState={INITIAL_VIEW_STATE}
      >
        <DeckGLOverlay layers={layers} />
        <Popup />
      </Map>
      <Leva oneLineLabels={true} hidden={!uiVisible} />
    </>
  );
}

export default MapWrapper;
