import { Feature, FeatureCollection, Geometry } from "geojson";
import { useCallback, useMemo } from "react";
import { County } from "@/types";
import Select from "react-select";

function Search({
  counties,
  onSelectCounty,
}: {
  counties: FeatureCollection<Geometry, County>;
  onSelectCounty: (geoid: string) => void;
}) {
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
      onSelectCounty(e.value);
    },
    [onSelectCounty]
  );

  return (
    <div
      style={{
        // temporary styling
        position: "absolute",
        background: "rgba(0,0,0,.3)",
        width: "100%",
        height: "100%",
        zIndex: 2,
        textAlign: "center",
      }}
    >
      <Select
        options={options}
        onChange={onChange as any}
        isSearchable={true}
        autoFocus={true}
      />
    </div>
  );
}

export default Search;
