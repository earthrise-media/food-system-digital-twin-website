import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { MapboxOverlay, MapboxOverlayProps } from "@deck.gl/mapbox/typed";
import { Map, MapRef, useControl, useMap } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useAtomValue } from "jotai";
import Popup from "./_popup";
import "mapbox-gl/dist/mapbox-gl.css";
import { Style } from "mapbox-gl";
import useLayers from "@/hooks/useLayers";
import useFlows, {
  useFlowsWithCurvedPaths,
  useFlowsWithTrips,
} from "@/hooks/useFlows";
import { countiesAtom } from "@/atoms";
import { Leva } from "leva";
import useKeyPress from "@/hooks/useKeyPress";
import useSelectedCounty from "@/hooks/useSelectedCounty";
import { centroid } from "turf";

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
  mapStyle: Style;
};

function MapWrapper({ mapStyle }: MapWrapperProps) {
  const counties = useAtomValue(countiesAtom);
  const selectedLinks = useFlows();
  const linksWithCurvedPaths = useFlowsWithCurvedPaths(selectedLinks);
  const linksWithTrips = useFlowsWithTrips(linksWithCurvedPaths);

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

  const mapRef = useRef<MapRef>(null);
  const selectedCounty = useSelectedCounty();
  useEffect(() => {
    if (!selectedCounty) return;
    mapRef.current?.flyTo({
      center: centroid(selectedCounty).geometry.coordinates as any,
      padding: { left: 200, top: 0, right: 0, bottom: 0 },
    });
  }, [selectedCounty]);

  return (
    <>
      <Map
        ref={mapRef}
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
