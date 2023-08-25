import { useCallback, useMemo } from "react";
import Select from "react-select";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import styles from "@/styles/Search.module.css";
import { countiesAtom, countyAtom, foodGroupAtom, searchAtom } from "@/atoms";
import { useHideable } from "@/hooks/useHideable";

function Search() {
  const counties = useAtomValue(countiesAtom);
  const [search, setSearch] = useAtom(searchAtom);
  const setCounty = useSetAtom(countyAtom);
  const setFoodGroup = useSetAtom(foodGroupAtom);
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
      setFoodGroup(null);
    },
    [setCounty, setSearch, setFoodGroup]
  );

  const { className, style, stage } = useHideable(search, styles.wrapper, styles.hidden)

  return (
    <div className={className} style={style} onClick={() => setSearch(false)}>
      <button className={styles.close} onClick={() => setSearch(false)} />

      <div onClick={(e) => e.stopPropagation()}>
        <Select
          options={options}
          onChange={onChange as any}
          isSearchable={true}
          closeMenuOnSelect={false}
          closeMenuOnScroll={false}
          autoFocus={true}
          placeholder="Enter a US county name"
          unstyled
          maxMenuHeight={500}
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
    </div>
  );
}

export default Search;
