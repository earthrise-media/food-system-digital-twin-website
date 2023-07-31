import dynamic from "next/dynamic";
import Head from "next/head";
import cx from "classnames";
import { useEffect } from "react";
import { FeatureCollection, Geometry } from "geojson";
import { Style } from "mapbox-gl";
import { useAtomValue, useSetAtom } from "jotai";
import styles from "@/styles/Home.module.css";
import { getLocalData } from "../lib/getLocalData";
import Sidebar from "@/components/sidebar/_sidebar";
import { Kumbh_Sans } from "next/font/google";
import Search from "@/components/_search";
import { countiesAtom, searchAtom } from "@/atoms";
import { County } from "@/types";
import Roads from "@/components/sidebar/_roads";
import AdverseConditions from "@/components/sidebar/_stressConditions";

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
        <DeckMap initialMapStyle={mapStyle} />
        <Sidebar />
        <div className={styles.mapParamsCards}>
          <Roads />
          <AdverseConditions />
        </div>
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
