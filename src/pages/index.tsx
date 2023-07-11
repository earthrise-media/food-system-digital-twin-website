import dynamic from "next/dynamic";
import Head from "next/head";
import cx from "classnames";
import { useEffect, useMemo } from "react";
import { FeatureCollection, Geometry } from "geojson";
import { Style } from "mapbox-gl";
import { useAtomValue, useSetAtom } from "jotai";
import styles from "@/styles/Home.module.css";
import { getLocalData } from "../lib/getLocalData";
import FlowInfo from "@/components/_flowInfo";
import { Kumbh_Sans } from "next/font/google";
import Search from "@/components/_search";
import { countiesAtom, searchAtom } from "@/atoms";
import { County } from "@/types";

// https://github.com/visgl/deck.gl/issues/7735
const DeckMap = dynamic(() => import("@/components/_map"), {
  ssr: false,
});

export const kumbhSans = Kumbh_Sans({ subsets: ["latin"] });

export default function Home({
  counties,
  mapStyle,
}: {
  counties: FeatureCollection;
  mapStyle: Style;
}) {

  // Inject the counties topojson into the map style
  const mapStyleWithData = useMemo(() => {
    return mapStyle;
    const index = mapStyle.layers.findIndex((l) => l.id === "admin-2-boundary-bg");

    return {
      ...mapStyle,
      sources: {
        ...mapStyle.sources,
        counties: {
          type: "geojson",
          data: counties,
        },
      },
      layers: [
        ...mapStyle.layers.slice(0, index),
        {
          id: "counties",
          type: "fill",
          source: "counties",
          paint: {
            "fill-color": "rgba(255,255,255,1)",
            "fill-outline-color": "rgb(246, 243, 238)"
          },
        },
        {
          id: "counties-lines",
          type: "line",
          source: "counties",
          paint: {
            "line-color": "rgb(246, 243, 238)",
            "line-width": 1.5,

          },
        },
        ...mapStyle.layers.slice(index),
      ],
    } as Style;
  }, [counties, mapStyle]);
  const setCounties = useSetAtom(countiesAtom);
  const search = useAtomValue(searchAtom);

  useEffect(() => {
    setCounties(counties as FeatureCollection<Geometry, County>);
  }, [setCounties, counties]);

  return (
    <>
      <Head>
        <title>Food Twin</title>
        <meta name="description" content="A project by Earth Genome" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={cx(styles.main, kumbhSans.className)}>
        <DeckMap mapStyle={mapStyleWithData} />
        <FlowInfo />
        {search && <Search />}
      </main>
    </>
  );
}

export async function getStaticProps() {
  const { counties, mapStyle } = await getLocalData();
  return {
    props: {
      counties,
      mapStyle,
    },
  };
}
