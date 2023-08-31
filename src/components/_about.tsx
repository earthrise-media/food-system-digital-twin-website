import { useHideable } from "@/hooks/useHideable";
import styles from "@/styles/About.module.css";
import LogoIntro from "./_logoIntro";
import { useEffect, useState } from "react";
import { useCountyData, useFlowsData } from "@/hooks/useAPI";
import { useAtom } from "jotai";
import { aboutAtom } from "@/atoms";

export default function About() {
  const [initiallyLoaded, setInitiallyLoaded] = useState(false);
  const { isLoading } = useFlowsData();
  const { isLoading: isCountyLoading } = useCountyData();
  const [isAboutVisible, setAboutVisible] = useAtom(aboutAtom);

  useEffect(() => {
    if (!isLoading && !isCountyLoading && !initiallyLoaded) {
      setInitiallyLoaded(true);
    }
  }, [isLoading, isCountyLoading, initiallyLoaded]);

  // const { shouldMount, className, style } = useHideable(
  //   !initiallyLoaded,
  //   styles.loaderText,
  //   styles.loaderHidden,
  //   undefined,
  //   1000
  // );

  // if (!shouldMount) return null;

  if (!isAboutVisible) return null;

  return (
    // <div className={className} style={style}>
    <div className={styles.loader}>
      <div className={styles.logoWrapper}>
        <LogoIntro />
        <button disabled={!initiallyLoaded} onClick={() => setAboutVisible(false)}>
          {!initiallyLoaded ? (
            <div className={styles.loaderText}>loading...</div>
          ) : (
            "Explore the map"
          )}
        </button>
      </div>
    </div>
  );
}
