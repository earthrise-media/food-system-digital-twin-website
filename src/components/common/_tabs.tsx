import styles from "@/styles/Tabs.module.css";
import classNames from "classnames";
export interface TabsProps {
  options: { value: any; label: string }[];
  selectedOption?: any;
  onChange: (value: any) => void;
}

export default function Tabs({ options, selectedOption, onChange }: TabsProps) {
  return (
    <ul className={styles.tabs}>
      {options.map((option) => (
        <li
          key={option.value}
          className={classNames({
            [styles.active]: option.value === selectedOption,
          })}
        >
          <button
            type="button"
            aria-pressed={option.value === selectedOption}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        </li>
      ))}
    </ul>
  );
}
