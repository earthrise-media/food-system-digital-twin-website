import { useCallback, useMemo } from "react";
import Select from "react-select";
import { useAtomValue, useSetAtom } from "jotai";
import styles from "@/styles/Search.module.css";
import { countiesAtom, countyAtom, searchAtom } from "@/atoms";

function Search() {
  const counties = useAtomValue(countiesAtom);
  const setSearch = useSetAtom(searchAtom);
  const setCounty = useSetAtom(countyAtom);
  const options = useMemo(() => {
    if (!counties) return [];
    return counties.features.map((county) => {
      const { name, stusps } = county.properties;
      return {
        label: `${name}, ${stusps}`,
        value: county.properties.geoid,
      };
    });
  }, [counties]);

  const onChange = useCallback(
    ({ value }: { value: string }) => {
      setCounty(value);
      setSearch(false);
    },
    [setCounty, setSearch]
  );

  return (
    <div className={styles.wrapper}>
      <button className={styles.close} onClick={() => setSearch(false)} />

      <Select
        options={options}
        onChange={onChange as any}
        isSearchable={true}
        // isClearable={true}
        closeMenuOnSelect={false}
        closeMenuOnScroll={false}
        autoFocus={true}
        unstyled
        classNames={{
          container: () => styles.search,
          control: () => styles.control,
          dropdownIndicator: () => styles.dropdownIndicator,
          placeholder: () => styles.placeholder,
          menu: () => styles.menu,
          option: () => styles.option,
        }}
      />
    </div>
  );
}

export default Search;
