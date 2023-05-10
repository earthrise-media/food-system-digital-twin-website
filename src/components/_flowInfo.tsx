import React from "react";
import styles from "@/styles/FlowInfo.module.css";

type FlowInfoProps = {};

function FlowInfo({}: FlowInfoProps) {
  return (
    <div className={styles.flowInfo}>
      <nav>
        <button>Search county</button>
        <h1>New York City, NY</h1>
        <div className={styles.tabBar}>
          <button className={styles.tabSelected}>Consumer</button>
          <button>Producer</button>
        </div>
      </nav>
      <div className={styles.content}>
        <div className={styles.summary}>
          <dl>
            <dt>Population:</dt>
            <dd>
              <b>8.773</b> million
            </dd>
          </dl>
          <dl>
            <dt>Calories consumed:</dt>
            <dd>
              <b>~323,234</b> kcal
            </dd>
          </dl>
        </div>
        <div className={styles.stats}>
          <h2>Main crops consumed:</h2>
          <ul className={styles.crops}>
            <li data-pct={.439}>Grain</li>
            <li data-pct={.223}>Nuts</li>
            <li data-pct={.189}>Vegetables</li>
            <li data-pct={.123}>Fruit</li>
            <li data-pct={.059}>Tubers</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default FlowInfo;
