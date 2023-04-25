import Head from 'next/head'
import styles from '@/styles/Home.module.css'
// import MapWrapper from './_map'
import { FeatureCollection } from 'geojson'
import { getLocalData } from './getLocalData';
import dynamic from 'next/dynamic';

// https://github.com/visgl/deck.gl/issues/7735
const DeckMap = dynamic(() => import('./_map'), {
  ssr: false
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
  )
}

export async function getStaticProps() {
  const counties = await getLocalData()
  return {
    props: {
      counties,
    },
  };
}
