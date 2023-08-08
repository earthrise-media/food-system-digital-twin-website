import { useHideable } from "@/hooks/useHideable";
import styles from "@/styles/Loader.module.css";
import Logo from "./_logo";
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
    1000
  );

  if (!shouldMount) return null;

  return (
    <div className={className} style={style}>
      <div className={styles.logoWrapper}>
        <Logo />
        <div className={styles.loaderText}>loading...</div>
      </div>
    </div>
  );
}
