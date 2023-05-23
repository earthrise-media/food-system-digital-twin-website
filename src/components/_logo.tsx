import styles from "@/styles/Logo.module.css";

export default function Logo() {
  return (
    <a className={styles.logo} href="https://theplotline.org/">
      Food Twin
      <br />
      by The <b>Plotline</b>
    </a>
  );
}
