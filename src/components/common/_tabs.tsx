export interface TabsProps {
  options: { value: string; label: string }[];
  selectedOption?: string;
  onChange: (value: string) => void;
}

export default function Tabs({ options, selectedOption, onChange }: TabsProps) {
  return (
    <ul>
      {options.map((option) => (
        <li key={option.value}>
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
