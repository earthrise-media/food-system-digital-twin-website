import styles from "@/styles/SubBlocks.module.css";
import Toggle from "../common/_toggle";
import classNames from "classnames";
import { useAtom } from "jotai";
import { adverseConditionsAtom } from "@/atoms";
import { useCallback } from "react";

export default function AdverseConditions() {
  const [adverseConditions, setAdverseConditions] = useAtom(adverseConditionsAtom);
  const onToggle = useCallback(() => {
    if (adverseConditions === null) {
      setAdverseConditions("drought");
    } else {
      setAdverseConditions(null);
    }
  }, [adverseConditions, setAdverseConditions]);

  return <div className={classNames(styles.subBlock, { [styles.active]: adverseConditions !== null })}>
  <h4>
    Simulate adverse conditions <Toggle checked={adverseConditions !== null} onChange={onToggle} />
  </h4>
</div>
}
