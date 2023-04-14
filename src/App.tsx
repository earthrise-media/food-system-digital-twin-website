import React, { useEffect, useState } from "react";
import MapWrapper from "./Map";
import counties from "./county_shapes.json";
import papa from "papaparse";

const DATA_URL =
  "https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/arc/counties.json"; // eslint-disable-line

export default function App() {
  const [data, setData] = useState();
  useEffect(() => {
    fetch(DATA_URL)
      .then((response) => response.json())
      .then(({ features }) => {
        setData(features);
      });
  }, []);

  const [links, setLinks] = useState();
  useEffect(() => {
    fetch("./synthetic_kcal_state_crop_1_results_pivoted.csv")
      .then((response) => response.text())
      .then((data) => {
        const rows = papa.parse(data, { header: true }).data;
        setLinks(rows as any);
      });
  }, []);

  // fetch("./synthetic_kcal_state_crop_1_results_pivoted.csv")
  //   .then((response) => response.text())
  //   .then((data) => {
  //     const rows = papa.parse(data, { header: true }).data;
  //     console.log(rows[0].Supply);
  //     root.render(<App data={features} counties={counties.features as any} />);
  //     // console.log(data)
  //   });

  return <MapWrapper data={data} counties={counties.features as any} links={links as any} />;
}
