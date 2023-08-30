import { useHideable } from "@/hooks/useHideable";
import styles from "@/styles/Loader.module.css";
import LogoIntro from "./_logoIntro";
import { useEffect, useState } from "react";
import { useCountyData, useFlowsData } from "@/hooks/useAPI";

export default function Loader() {
  const [initiallyLoaded, setInitiallyLoaded] = useState(false);
  const { isLoading } = useFlowsData();
  const { isLoading: isCountyLoading } = useCountyData();

  useEffect(() => {
    if (!isLoading && !isCountyLoading && !initiallyLoaded) {
      setInitiallyLoaded(true);
    }
  }, [isLoading, isCountyLoading, initiallyLoaded]);

  const { shouldMount, className, style } = useHideable(
    !initiallyLoaded,
    styles.loader,
    styles.loaderHidden,
    undefined,
    1000
  );

  if (!shouldMount) return null;

  return (
    <div className={className} style={style}>
      <div className={styles.logoWrapper}>
        <LogoIntro />
        <div className={styles.loaderText}>loading...</div>
      </div>
    </div>
  );
}
