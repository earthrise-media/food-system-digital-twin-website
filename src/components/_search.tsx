import { Feature, FeatureCollection, Geometry } from "geojson";
import { useCallback, useMemo } from "react";
import { County } from "@/types";
import Select from "react-select";
import { useSetAtom } from "jotai";
import styles from "@/styles/Search.module.css";
import { searchAtom } from "@/atoms";

function Search({
  counties,
  onSelectCounty,
}: {
  counties: FeatureCollection<Geometry, County>;
  onSelectCounty?: (geoid: string) => void;
}) {
  const setSearch = useSetAtom(searchAtom);
  const options = useMemo(() => {
    return counties.features.map((county) => {
      const { name, stusps } = county.properties;
      return {
        label: `${name}, ${stusps}`,
        value: county.properties.geoid,
      };
    });
  }, [counties]);

  const onChange = useCallback(
    (e: { value: string }) => {
      onSelectCounty && onSelectCounty(e.value);
    },
    [onSelectCounty]
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
