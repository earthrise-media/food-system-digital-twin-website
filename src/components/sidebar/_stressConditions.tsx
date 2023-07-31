import styles from "@/styles/MapParamsCard.module.css";
import Toggle from "../common/_toggle";
import classNames from "classnames";
import { useAtom } from "jotai";
import { adverseConditionsAtom } from "@/atoms";
import { useCallback } from "react";
import Tabs from "../common/_tabs";
import { ADVERSE_CONDITIONS_OPTIONS } from "@/constants";
import { AdverseConditions } from "@/types";

export default function StressConditions() {
  const [adverseConditions, setAdverseConditions] = useAtom(
    adverseConditionsAtom
  );
  const onToggle = useCallback(() => {
    if (adverseConditions === null) {
      setAdverseConditions("drought");
    } else {
      setAdverseConditions(null);
    }
  }, [adverseConditions, setAdverseConditions]);

  return (
    <div
      className={classNames(styles.card, styles.stressConditions, {
        [styles.active]: adverseConditions !== null,
      })}
    >
      <h4>
        Simulate stress conditions{" "}
        <Toggle checked={adverseConditions !== null} onChange={onToggle} />
      </h4>
      {adverseConditions && (
        <Tabs
          options={ADVERSE_CONDITIONS_OPTIONS}
          selectedOption={adverseConditions || undefined}
          onChange={(value) => setAdverseConditions(value as AdverseConditions)}
        />
      )}
    </div>
  );
}
