import styles from "@/styles/LogoIntro.module.css";

export default function Logo() {
  return (
    <div className={styles.logoWrapper}>
      <span className={styles.logo}>
        Food Twin
        <br />
        by <b>The Plotline</b>
      </span>
    </div>
  );
}
