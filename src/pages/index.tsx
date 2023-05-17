import dynamic from "next/dynamic";
import Head from "next/head";
import cx from "classnames";
import { useEffect, useState } from "react";
import { FeatureCollection, Geometry } from "geojson";
import papa from "papaparse";
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

const kumbhSans = Kumbh_Sans({ subsets: ["latin"] });

export default function Home({
  counties,
  mapStyle,
}: {
  counties: FeatureCollection;
  mapStyle: Style;
}) {
  const [links, setLinks] = useState<Record<string, number>[]>();
  const setCounties = useSetAtom(countiesAtom);
  const search = useAtomValue(searchAtom);

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
          setLinks(rows as Record<string, number>[]);
        } else {
          const links = counties.features.map((county) => {
            const link: Record<string, number> = {
              Supply: county?.properties?.geoid,
            }
            counties.features.forEach((target) => {
              link[target?.properties?.geoid] = Math.floor(15000 * Math.random());
            });
            return link
          })
          setLinks(links);
        };
      });
  }, []);

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
        {links && <DeckMap mapStyle={mapStyle} links={links} />}
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
