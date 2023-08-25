import styles from "@/styles/Logo.module.css";

export default function Logo() {
  return (
    <div className={styles.logoWrapper}>
      <a className={styles.logo} href="https://theplotline.org/">
        Food Twin
        <br />
        by <b>The Plotline</b>
      </a>
    </div>
  );
}
