import Head from "next/head";
import styles from "@/styles/Home.module.css";
import { FeatureCollection } from "geojson";
import { getLocalData } from "../lib/getLocalData";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import papa from "papaparse";
import { Style } from "mapbox-gl";
import FlowInfo from "@/components/_flowInfo";
import cx from "classnames";
import { Kumbh_Sans } from "next/font/google";
import Search from "@/components/_search";

// https://github.com/visgl/deck.gl/issues/7735
const DeckMap = dynamic(() => import("@/components/_map"), {
  ssr: false,
});

const kumbhSans = Kumbh_Sans({ subsets: ["latin"] });

export default function Home({
  counties,
  mapStyle,
}: {
  counties: FeatureCollection;
  mapStyle: Style;
}) {
  const [links, setLinks] = useState<Record<string, number>[]>();
  useEffect(() => {
    fetch("/synthetic_kcal_state_crop_1_results_pivoted.csv")
      .then((response) => response.text())
      .then((data) => {
        const rows = papa.parse(data, {
          header: true,
          dynamicTyping: true,
        }).data;
        setLinks(rows as Record<string, number>[]);
      });
  }, []);

  // TODO handle app state
  const searching = false;

  return (
    <>
      <Head>
        <title>Food Twin</title>
        <meta name="description" content="A project by Earth Genome" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={cx(styles.main, kumbhSans.className)}>
        {links && (
          <DeckMap
            counties={counties as any}
            mapStyle={mapStyle}
            links={links}
          />
        )}
        <FlowInfo />
        {searching && <Search counties={counties as any} />}
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
