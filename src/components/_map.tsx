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
import { useAtom, useAtomValue } from "jotai";
import SelectedPopup from "./popups/_selectedPopup";
import HighlightPopup from "./popups/_highlightPopup";
import LinkedPopup from "./popups/_linkedPopup";
import styles from "@/styles/Map.module.css";
import "mapbox-gl/dist/mapbox-gl.css";
import { Style } from "mapbox-gl";
import useLayers from "@/hooks/useLayers";
import useFlows, {
  useFlowsWithCurvedPaths,
  useFlowsWithRoadPaths,
  useFlowsWithTrips,
} from "@/hooks/useFlows";
import {
  allLinkedCountiesAtom,
  flowTypeAtom,
  highlightedCountyAtom,
  searchAtom,
  selectedCountyAtom,
  viewportAtom,
} from "@/atoms";
import { Leva } from "leva";
import useKeyPress from "@/hooks/useKeyPress";
import { centroid } from "turf";
import { useFlowsData } from "@/hooks/useAPI";
import { CountyWithRank, RawFlowsInbound, RawFlowsOutbound } from "@/types";
import { countyAtom } from "@/atoms";
import useMapStyle from "@/hooks/useMapStyle";
import useLinkedCounties from "@/hooks/useLinkedCounties";
import { SIDEBAR_WIDTH, TOP_COUNTIES_NUMBER } from "@/constants";
import { Feature, Geometry } from "geojson";
import HighlightedLinkedPopup from "./popups/_highlightedLinkedPopup";
import { useHideable } from "@/hooks/useHideable";

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
  const [viewport, setViewport] = useAtom(viewportAtom);

  const { data: flowsData, error, isLoading } = useFlowsData();
  const selectedFlows = useFlows();

  const selectedCounty = useAtomValue(selectedCountyAtom);
  const flowsWithCurvedPaths = useFlowsWithCurvedPaths(selectedFlows);
  const flowsWithRoadPaths = useFlowsWithRoadPaths(selectedFlows);
  const flowsWithTrips = useFlowsWithTrips(
    flowsWithCurvedPaths,
    flowsWithRoadPaths,
    Math.floor(viewport.zoom / 2)
  );
  const highlightedCounty = useAtomValue(highlightedCountyAtom);
  const mapStyle = useMapStyle(initialMapStyle, selectedFlows);

  const search = useAtomValue(searchAtom);
  const { className, style } = useHideable(
    !search,
    styles.container,
    styles.hidden
  );

  const flowType = useAtomValue(flowTypeAtom);

  const { linkedCounties } = useLinkedCounties();
  const allLinkedCounties = useAtomValue(allLinkedCountiesAtom);

  const linkedCountiesWithRank = useMemo<
    Feature<Geometry, CountyWithRank>[]
  >(() => {
    if (!linkedCounties) return [];
    const linkedCountiesWithRank = linkedCounties.map((c, i) => ({
      ...c,
      properties: {
        ...c.properties,
        rank: i + 1,
      },
    }));
    return linkedCountiesWithRank;
  }, [linkedCounties]);

  // Linked counties (top or all depending on selection)
  const linkedCountiesSliced = useMemo<
    Feature<Geometry, CountyWithRank>[]
  >(() => {
    if (!linkedCountiesWithRank) return [];
    const topCounties = linkedCountiesWithRank
      .slice(0, allLinkedCounties ? Number.MAX_VALUE : TOP_COUNTIES_NUMBER)
      .reverse();
    return topCounties;
  }, [linkedCountiesWithRank, allLinkedCounties]);

  // Highlighted county that is a linked county --> full popup
  const linkedHighlightedCounty = useMemo<Feature<
    Geometry,
    CountyWithRank
  > | null>(() => {
    if (!highlightedCounty || !linkedCountiesWithRank) return null;
    const linkedHighlightedCounty = linkedCountiesWithRank.find(
      (county) => county.properties.geoid === highlightedCounty.properties.geoid
    );
    if (!linkedHighlightedCounty) return null;
    return linkedHighlightedCounty;
  }, [highlightedCounty, linkedCountiesWithRank]);

  // Linked counties but only when no linkedHighlightedCounty is selected (Number + name depending on zoom)
  const linkedCountiesWithoutHighlightedLinked = useMemo(() => {
    if (!linkedCountiesSliced || linkedHighlightedCounty) return [];
    return linkedCountiesSliced;
  }, [linkedCountiesSliced, linkedHighlightedCounty]);

  // Highlighted county excluding linked counties --> Simple hover popup
  const simpleHighlightedCounty = useMemo(() => {
    if (!highlightedCounty) return;
    const highlightedTopCounty = linkedCountiesSliced.find(
      (county) => county.properties.geoid === highlightedCounty.properties.geoid
    );
    if (
      highlightedTopCounty ||
      linkedHighlightedCounty?.properties.geoid ===
        highlightedCounty.properties.geoid
    )
      return;
    return highlightedCounty;
  }, [highlightedCounty, linkedCountiesSliced, linkedHighlightedCounty]);

  const layers = useLayers(linkedCountiesSliced, flowsWithTrips, !isLoading);

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
      padding: { left: SIDEBAR_WIDTH, top: 0, right: 0, bottom: 0 },
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
    <div className={className} style={style}>
      {bannerError && <div className={styles.banner}>{bannerError}</div>}
      <Map
        {...viewport}
        id="map"
        onMove={(evt) => {
          setViewport(evt.viewState);
        }}
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
            {/* Fixed selected county */}
            {selectedCounty && <SelectedPopup county={selectedCounty} />}

            {!isLoading && (
              <>
                {/* Highlighted county that is a linked county */}
                {linkedHighlightedCounty && (
                  <HighlightedLinkedPopup county={linkedHighlightedCounty} />
                )}
                {/* Linked counties (top or all depending on selection) */}
                {linkedCountiesWithoutHighlightedLinked.map((county) => {
                  return (
                    <LinkedPopup
                      key={county.properties.geoid}
                      county={county}
                      numPopups={linkedCountiesWithoutHighlightedLinked.length}
                    />
                  );
                })}
              </>
            )}

            {/* Counties highlighted on mouse hover */}
            {simpleHighlightedCounty && (
              <HighlightPopup county={simpleHighlightedCounty} />
            )}
          </>
        )}
      </Map>
      <Leva oneLineLabels={true} hidden={!uiVisible} />
    </div>
  );
}

export default MapWrapper;
