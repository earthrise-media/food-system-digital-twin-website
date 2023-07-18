import { countyHighlightedAtom } from "@/atoms";
import useLinkedCounties from "@/hooks/useLinkedCounties";
import { County } from "@/types";
import { Feature, Geometry } from "geojson";
import { useAtom } from "jotai";
import styles from "@/styles/CountiesList.module.css";

export default function CountiesList() {
  const [countyHiglighted, setCountyHighlighted] = useAtom(
    countyHighlightedAtom
  );

  const topLinkedCountries = useLinkedCounties()

  // TODO add loading state
  if (!topLinkedCountries) return null;
  return (
    <ol>
      {topLinkedCountries.map((county: Feature<Geometry, County>) => (
        <li
          // TODO highlight on hover
          onMouseOver={() => setCountyHighlighted(county.properties.geoid)}
          onMouseOut={() => setCountyHighlighted(null)}
          key={county.properties.geoid}
        >
          {county.properties.name}, {county.properties.stusps}
        </li>
      ))}
    </ol>
  );
}
