import styles from "@/styles/SubBlocks.module.css";
import Toggle from "../common/_toggle";
import { useAtom } from "jotai";
import { roadsAtom } from "@/atoms";
import cx from 'classnames'

export default function Roads() {
  const [roads, setRoads] = useAtom(roadsAtom);
  return (
    <div className={cx(styles.subBlock, { [styles.active]: roads })}>
      <h4>
        Show road network <Toggle checked={roads} onChange={setRoads} />
      </h4>
    </div>
  );
}
