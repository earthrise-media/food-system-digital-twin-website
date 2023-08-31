import { aboutAtom } from "@/atoms";
import { SIDEBAR_WIDTH } from "@/constants";
import styles from "@/styles/Logo.module.css";
import { useSetAtom } from "jotai";

export default function Logo() {
  const setAbout = useSetAtom(aboutAtom);
  return (
    <div
      className={styles.logoWrapper}
      style={{ "--width": `${SIDEBAR_WIDTH}px` } as React.CSSProperties}
    >
      <a className={styles.logo} href="https://theplotline.org/">
        <b>Food Twin</b> by <u>The Plotline</u>
      </a>
      <button className={styles.about} onClick={() => setAbout(true)}>About</button>
    </div>
  );
}
