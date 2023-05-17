import Head from "next/head";
import styles from "@/styles/Home.module.css";
import { FeatureCollection } from "geojson";
import { getLocalData } from "../lib/getLocalData";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import papa from "papaparse";
import { Style } from "mapbox-gl";

// https://github.com/visgl/deck.gl/issues/7735
const DeckMap = dynamic(() => import("@/components/_map"), {
  ssr: false,
});

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
      .then((response) => {
        if (!response.ok) {
          return null;
        }
        return response.text();
      })
      .then((data) => {
        if (data) {
          const rows = papa.parse(data, {
            header: true,
            dynamicTyping: true,
          }).data;
          console.log(rows);
          setLinks(rows as Record<string, number>[]);
        } else {
          const links = counties.features.map((county) => {
            const link: Record<string, number> = {
              Supply: county?.properties?.geoid,
            }
            counties.features.forEach((target) => {
              link[target?.properties?.geoid] = 15000 * Math.random();
            });
            return link
          })
          setLinks(links);
        };
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
        {links && (
          <DeckMap
            counties={counties as any}
            mapStyle={mapStyle}
            links={links}
          />
        )}
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
