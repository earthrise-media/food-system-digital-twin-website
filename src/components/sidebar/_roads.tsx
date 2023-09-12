import styles from "@/styles/MapParamsCard.module.css";
import Toggle from "../common/_toggle";
import { useAtom } from "jotai";
import { roadsAtom } from "@/atoms";
import cx from "classnames";
import { useCallback } from "react";

export default function Roads() {
  const [roads, setRoads] = useAtom(roadsAtom);
  const onToggle = useCallback(() => {
    setRoads(!roads);
  }, [setRoads, roads]);
  return (
    <div className={cx(styles.card, styles.roads, { [styles.active]: roads })}>
      <div className={styles.header} onClick={onToggle}>
        <h4>
          Show road network <Toggle checked={roads} />
        </h4>
      </div>
    </div>
  );
}
