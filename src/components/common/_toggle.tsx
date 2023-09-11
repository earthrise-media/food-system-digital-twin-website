import styles from "@/styles/Toggle.module.css";
import { useId } from "react";

export default function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange?: (checked: boolean) => void;
}) {
  const id = useId()
  return (
    <div className={styles.toggle}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange ? onChange(e.target.checked) : void(0)}
      />
      <label htmlFor={id}>Toggle</label>
    </div>
  );
}
