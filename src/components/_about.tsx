import { useHideable } from "@/hooks/useHideable";
import styles from "@/styles/About.module.css";
import LogoIntro from "./_logoIntro";
import { useEffect, useState } from "react";
import { useCountyData, useFlowsData } from "@/hooks/useAPI";
import { useAtom } from "jotai";
import { aboutAtom } from "@/atoms";
import AboutContent from "./_aboutContent";
import classNames from "classnames";

export default function About() {
  const [initiallyLoaded, setInitiallyLoaded] = useState(false);
  const { isLoading } = useFlowsData();
  const { isLoading: isCountyLoading } = useCountyData();
  const [isAboutVisible, setAboutVisible] = useAtom(aboutAtom);
  const [anchor, setAnchor] = useState("what");

  useEffect(() => {
    if (!isLoading && !isCountyLoading && !initiallyLoaded) {
      setInitiallyLoaded(true);
    }
  }, [isLoading, isCountyLoading, initiallyLoaded]);

  const { shouldMount, className, style } = useHideable(
    isAboutVisible,
    styles.aboutWrapper,
    styles.hidden
  );

  if (!shouldMount) return null;

  return (
    <div className={className} style={style}>
      <div className={styles.about}>
        <div className={styles.header}>
          <LogoIntro />
          <button
            disabled={!initiallyLoaded}
            onClick={() => setAboutVisible(false)}
          >
            {!initiallyLoaded ? (
              <div className={styles.loaderText}>loading...</div>
            ) : (
              "Explore the map"
            )}
          </button>
        </div>
        <div className={styles.body}>
          <ul className={styles.anchors}>
            <li
              className={classNames({ [styles.selected]: anchor === "what" })}
            >
              <button onClick={() => setAnchor("what")}>
                what is this tool?
              </button>
            </li>
            <li
              className={classNames({
                [styles.selected]: anchor === "limitations",
              })}
            >
              <button onClick={() => setAnchor("limitations")}>
                what are the limitations?
              </button>
            </li>
            <li className={classNames({ [styles.selected]: anchor === "how" })}>
              <button onClick={() => setAnchor("how")}>
                how to use this tool?
              </button>
            </li>
          </ul>
          <div className={styles.anchorContent}>
            <AboutContent anchor={anchor} />
          </div>
        </div>
      </div>
    </div>
  );
}
