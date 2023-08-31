import styles from "@/styles/LogoIntro.module.css";

export default function Logo() {
  return (
    <div className={styles.logoWrapper}>
      <span className={styles.logo}>
        <b>Food Twin</b>
        <br />
        by The Plotline
      </span>
    </div>
  );
}
