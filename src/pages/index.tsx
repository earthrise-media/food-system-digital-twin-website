import Head from "next/head";
import styles from "@/styles/Home.module.css";
import { FeatureCollection } from "geojson";
import dynamic from "next/dynamic";
import db from "../helpers/db";

// https://github.com/visgl/deck.gl/issues/7735
const DeckMap = dynamic(() => import("./_map"), {
  ssr: false,
});

export default function Home({ counties }: { counties: FeatureCollection }) {
  return (
    <>
      <Head>
        <title>Food Twin</title>
        <meta name="description" content="A project by Earth Genome" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <DeckMap counties={counties as any} />
      </main>
    </>
  );
}

type CountyRecord = {
  geoid: string;
  geom: string;
};

export async function getStaticProps() {
  const allCounties: CountyRecord[] = await db<CountyRecord>("counties").select(
    db.raw("meta->'geoid' as geoid"),
    db.raw(`ST_AsGeoJSON(geom) as geom`)
  );

  const geojson = {
    type: "FeatureCollection",
    features: allCounties.map(({ geom, geoid }) => ({
      type: "Feature",
      geometry: JSON.parse(geom),
      properties: { geoid },
    })),
  };

  return {
    props: {
      counties: geojson,
    },
  };
}
