import styles from "@/styles/Toggle.module.css";

export default function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className={styles.toggle}>
      <input
        type="checkbox"
        id="switch"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <label htmlFor="switch">Toggle</label>
    </div>
  );
}
