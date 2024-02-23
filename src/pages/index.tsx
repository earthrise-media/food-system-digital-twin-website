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
import { aboutAtom, countiesAtom, searchAtom } from "@/atoms";
import { County } from "@/types";
import Roads from "@/components/sidebar/_roads";
import AdverseConditions from "@/components/sidebar/_stressConditions";
import { useHideable } from "@/hooks/useHideable";
import Logo from "@/components/_logo";
import About from "@/components/_about";
import { MapProvider } from "react-map-gl";
import { ErrorBoundary } from "react-error-boundary";

// https://github.com/visgl/deck.gl/issues/7735
const DeckMap = dynamic(() => import("@/components/_map"), {
  ssr: false,
});

export const kumbhSans = Kumbh_Sans({ subsets: ["latin"] });

export default function HomeWithErrorBoundary(props: any) {
  return (
    <ErrorBoundary
      fallback={<div>Something went wrong</div>}
      onError={() => {
        if (process.env.NODE_ENV !== "development")
          window.location.replace(location.href.replace(location.hash, ""));
      }}
    >
      <Home {...props} />
    </ErrorBoundary>
  );
}

function Home({
  counties,
  mapStyle,
}: {
  counties: FeatureCollection;
  mapStyle: Style;
}) {
  const setCounties = useSetAtom(countiesAtom);
  const search = useAtomValue(searchAtom);
  const about = useAtomValue(aboutAtom);

  useEffect(() => {
    setCounties(counties as FeatureCollection<Geometry, County>);
  }, [setCounties, counties]);

  const { shouldMount: shouldSearchMount } = useHideable(search);
  const {
    shouldMount: shouldMapParamsMount,
    className: mapParamsClassName,
    style,
  } = useHideable(!search && !about, styles.mapParamsCards, styles.mapParamsCardsHidden);

  return (
    <>
      <Head>
        <title>Food Twin</title>
        <meta name="description" content="A project by Earth Genome" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
          <script
            defer
            data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
            src="https://plausible.io/js/script.js"
          ></script>
        )}
      </Head>

      <MapProvider>
        <main className={cx(styles.main, kumbhSans.className)}>
          <About />
          <DeckMap initialMapStyle={mapStyle} />
          {(!search && !about) && (
            <div className={styles.logoWrapper}>
              <Logo />
            </div>
          )}

          <Sidebar />
          <div className={mapParamsClassName} style={style}>
            {shouldMapParamsMount && (
              <>
                <Roads />
                <AdverseConditions />
              </>
            )}
          </div>
          {shouldSearchMount && <Search />}
        </main>
      </MapProvider>
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
