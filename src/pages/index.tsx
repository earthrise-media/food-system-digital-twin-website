import Head from "next/head";
import styles from "@/styles/Home.module.css";
// import MapWrapper from './_map'
import { FeatureCollection } from "geojson";
import { getLocalData } from "./getLocalData";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import papa from "papaparse";

// https://github.com/visgl/deck.gl/issues/7735
const DeckMap = dynamic(() => import("./_map"), {
  ssr: false,
});

export default function Home({ counties }: { counties: FeatureCollection }) {
  const [links, setLinks] = useState<Record<string, number>[]>();
  useEffect(() => {
    fetch("/synthetic_kcal_state_crop_1_results_pivoted.csv")
      .then((response) => response.text())
      .then((data) => {
        const rows = papa.parse(data, { header: true, dynamicTyping: true }).data;
        setLinks(rows as Record<string, number>[]);
      });
  }, []);

  return (
    <>
      <Head>
        <title>Food Twin</title>
        <meta name="description" content="A project by Earth Genome" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        {links && <DeckMap counties={counties as any} links={links} />}
      </main>
    </>
  );
}

export async function getStaticProps() {
  const counties = await getLocalData();
  return {
    props: {
      counties,
    },
  };
}
