import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { MapboxOverlay, MapboxOverlayProps } from "@deck.gl/mapbox/typed";
import { Map, MapRef, useControl } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useAtomValue } from "jotai";
import Popup from "./_mainPopup";
import styles from "@/styles/Map.module.css";
import "mapbox-gl/dist/mapbox-gl.css";
import { Style } from "mapbox-gl";
import useLayers from "@/hooks/useLayers";
import useFlows, {
  useFlowsWithCurvedPaths,
  useFlowsWithTrips,
} from "@/hooks/useFlows";
import {
  flowTypeAtom,
  highlightedCountyAtom,
  searchAtom,
  selectedCountyAtom,
} from "@/atoms";
import { Leva } from "leva";
import useKeyPress from "@/hooks/useKeyPress";
import { centroid } from "turf";
import HighlightPopup from "./_highlightPopup";
import LinkedPopup from "./_linkedPopup";
import { useFlowsData } from "@/hooks/useAPI";
import { RawFlowsInbound, RawFlowsOutbound } from "@/types";
import { countyAtom } from "@/atoms";
import useMapStyle from "@/hooks/useMapStyle";
import useLinkedCounties from "@/hooks/useLinkedCounties";
import { TOP_COUNTIES_NUMBER } from "@/constants";

const INITIAL_VIEW_STATE = {
  longitude: -98,
  latitude: 37,
  zoom: 4,
  pitch: 30,
  bearing: 0,
};

const MAX_BOUNDS = [
  [-160, 0],
  [-50, 60],
];

export const MIN_ZOOM = 3;
export const MAX_ZOOM = 8;

function DeckGLOverlay(props: MapboxOverlayProps) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

type MapWrapperProps = {
  initialMapStyle: Style;
};

function MapWrapper({ initialMapStyle }: MapWrapperProps) {
  const { data: flowsData, error, isLoading } = useFlowsData();
  const selectedFlows = useFlows();

  const flowsWithCurvedPaths = useFlowsWithCurvedPaths(selectedFlows);
  const flowsWithTrips = useFlowsWithTrips(flowsWithCurvedPaths);
  const highlightedCounty = useAtomValue(highlightedCountyAtom);
  const mapStyle = useMapStyle(initialMapStyle, selectedFlows);

  const search = useAtomValue(searchAtom);
  const flowType = useAtomValue(flowTypeAtom);

  const linkedCounties = useLinkedCounties();
  const selectedCounty = useAtomValue(selectedCountyAtom);

  const topCounties = useMemo(() => {
    if (!linkedCounties) return [];
    const topCounties = linkedCounties
      .slice(0, TOP_COUNTIES_NUMBER)
      .map((c, i) => ({
        ...c,
        properties: {
          ...c.properties,
          rank: i + 1,
        },
      }));
    return topCounties;
  }, [linkedCounties]);

  const linkedHighlightedCounty = useMemo(() => {
    if (!highlightedCounty || !linkedCounties) return;
    const highlightedTopCounty = topCounties.find(
      (county) => county.properties.geoid === highlightedCounty.properties.geoid
    );
    if (!highlightedTopCounty) {
      const linkedHighlightedCountyIndex = linkedCounties.findIndex(
        (county) =>
          county.properties.geoid === highlightedCounty.properties.geoid
      );
      if (linkedHighlightedCountyIndex === -1) return;
      const linkedHighlightedCounty =
        linkedCounties[linkedHighlightedCountyIndex];
      return {
        ...linkedHighlightedCounty,
        properties: {
          ...linkedHighlightedCounty.properties,
          rank: linkedHighlightedCountyIndex + 1,
        },
      };
    }
  }, [linkedCounties, highlightedCounty, topCounties]);

  const simpleHighlightedCounty = useMemo(() => {
    if (!highlightedCounty) return;
    const highlightedTopCounty = topCounties.find(
      (county) => county.properties.geoid === highlightedCounty.properties.geoid
    );
    if (
      highlightedTopCounty ||
      linkedHighlightedCounty?.properties.geoid ===
        highlightedCounty.properties.geoid
    )
      return;
    return highlightedCounty;
  }, [highlightedCounty, topCounties, linkedHighlightedCounty]);

  const [viewState, setViewState] = React.useState(INITIAL_VIEW_STATE);

  const layers = useLayers(
    linkedCounties,
    flowsWithTrips,
    Math.floor(viewState.zoom),
    !search
  );

  const [uiVisible, setUiVisible] = useState(false);
  const toggleUI = useCallback(() => {
    setUiVisible((v) => !v);
  }, [setUiVisible]);
  useKeyPress("u", toggleUI);

  const mapRef = useRef<MapRef>(null);
  useEffect(() => {
    if (!selectedCounty) return;
    mapRef.current?.flyTo({
      center: centroid(selectedCounty).geometry.coordinates as any,
      padding: { left: 200, top: 0, right: 0, bottom: 0 },
    });
  }, [selectedCounty]);

  const currentCountyId = useAtomValue(countyAtom);
  const bannerError = useMemo(() => {
    if (error) return "Error loading county calories";
    else if (isLoading) return "Loading...";
    else if (flowsData) {
      const data =
        (flowsData as RawFlowsOutbound).outbound ||
        (flowsData as RawFlowsInbound).inbound;
      if (!data.length)
        return flowType === "consumer"
          ? "No calories consumed in this county"
          : "No calories produced in this county";
      else if (data.length === 1 && data[0].county_id === currentCountyId)
        return flowType === "consumer"
          ? "All calories consumed in this county produced internally"
          : "All calories produced in this county consumed internally";
      return null;
    } else return null;
  }, [flowsData, isLoading, error, currentCountyId, flowType]);

  return (
    <>
      {bannerError && <div className={styles.banner}>{bannerError}</div>}
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        ref={mapRef}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        mapStyle={mapStyle}
        maxBounds={MAX_BOUNDS as any}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
      >
        <DeckGLOverlay layers={layers} />
        {!search && (
          <>
            {topCounties.map((county) => {
              return (
                <LinkedPopup key={county.properties.geoid} county={county} />
              );
            })}
            {linkedHighlightedCounty && (
              <LinkedPopup county={linkedHighlightedCounty} />
            )}
            {selectedCounty && <Popup county={selectedCounty} />}
            {simpleHighlightedCounty && (
              <HighlightPopup county={simpleHighlightedCounty} />
            )}
          </>
        )}
      </Map>
      <Leva oneLineLabels={true} hidden={!uiVisible} />
    </>
  );
}

export default MapWrapper;
