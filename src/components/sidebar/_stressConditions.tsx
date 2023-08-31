import styles from "@/styles/MapParamsCard.module.css";
import Toggle from "../common/_toggle";
import classNames from "classnames";
import { useAtom } from "jotai";
import { adverseConditionsAtom } from "@/atoms";
import { useCallback } from "react";
import Tabs from "../common/_tabs";
import { ADVERSE_CONDITIONS_OPTIONS, STRESS_PALETTE } from "@/constants";
import { AdverseConditions } from "@/types";
import { useHideable } from "@/hooks/useHideable";

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

  const { className, style, stage, shouldMount } = useHideable(
    !!adverseConditions,
    styles.content,
    styles.contentHidden
  );

  return (
    <div
      className={classNames(styles.card, styles.stressConditions, {
        [styles.active]: adverseConditions !== null,
      })}
    >
      <div className={styles.header} onClick={onToggle}>
        <h4>
          Simulate stress conditions{" "}
          <Toggle checked={adverseConditions !== null} />
        </h4>
      </div>

      <div className={className} style={style}>
        {shouldMount && (
          <div>
            <Tabs
              options={ADVERSE_CONDITIONS_OPTIONS}
              selectedOption={adverseConditions || undefined}
              onChange={(value) =>
                setAdverseConditions(value as AdverseConditions)
              }
            />
            <div className={styles.legend}>
              {STRESS_PALETTE.map((color, i) => (
                <div
                  key={i}
                  className={styles.legendItem}
                  style={{ backgroundColor: color }}
                ></div>
              ))}
            </div>
              <div className={styles.legendLabels}>
                <div>Low</div>
                <div>High</div>
              </div>
          </div>
        )}
      </div>
    </div>
  );
}
