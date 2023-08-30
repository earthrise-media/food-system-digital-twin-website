import styles from "@/styles/MapParamsCard.module.css";
import Toggle from "../common/_toggle";
import { useAtom } from "jotai";
import { roadsAtom } from "@/atoms";
import cx from "classnames";

export default function Roads() {
  const [roads, setRoads] = useAtom(roadsAtom);
  return (
    <div className={cx(styles.card, styles.roads, { [styles.active]: roads })}>
      <div className={styles.header}>
        <h4>
          Show road network <Toggle checked={roads} onChange={setRoads} />
        </h4>
      </div>
    </div>
  );
}
