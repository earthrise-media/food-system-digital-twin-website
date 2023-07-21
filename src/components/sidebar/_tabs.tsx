import cx from "classnames";
import styles from "@/styles/Tabs.module.css";
import { useAtom } from "jotai";
import { flowTypeAtom } from "@/atoms";

export default function Tabs() {
  const [flowType, setFlowType] = useAtom(flowTypeAtom);
  return (
    <div className={styles.tabBar}>
      <button
        onClick={() => setFlowType("producer")}
        className={cx(styles.producer, {
          [styles.selected]: flowType === "producer",
        })}
      >
        Producer
      </button>
      <button
        onClick={() => setFlowType("consumer")}
        className={cx(styles.consumer, {
          [styles.selected]: flowType === "consumer",
        })}
      >
        Consumer
      </button>
    </div>
  );
}
