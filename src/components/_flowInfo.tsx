import React from "react";
import styles from "@/styles/FlowInfo.module.css";
import { CATEGORY_COLORS } from "@/constants";
import cx from "classnames";
import Logo from "./_logo";

type FlowInfoProps = {};

function FlowInfo({}: FlowInfoProps) {
  return (
    <div className={styles.flowInfo}>
      <div className={styles.logoWrapper}>
        <Logo />
      </div>

      <nav>
        <button>Search county</button>
        <h2>New York City, NY</h2>
        <div className={styles.tabBar}>
          <button className={cx(styles.consumer, styles.selected)}>
            Consumer
          </button>
          <button className={cx(styles.producer)}>Producer</button>
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
          <h3>Main crops consumed:</h3>
          <ul className={styles.crops}>
            <li
              style={
                {
                  "--color": CATEGORY_COLORS.grain,
                  "--width": "43.9%",
                } as React.CSSProperties
              }
            >
              <dl>
                <dt>Grain</dt>
                <dd>43.9%</dd>
              </dl>
            </li>
            <li
              style={
                {
                  "--color": CATEGORY_COLORS.nuts,
                  "--width": "22.3%",
                } as React.CSSProperties
              }
            >
              <dl>
                <dt>Nuts</dt>
                <dd>22.3%</dd>
              </dl>
            </li>
            <li
              style={
                {
                  "--color": CATEGORY_COLORS.vegetables,
                  "--width": "18.9%",
                } as React.CSSProperties
              }
            >
              <dl>
                <dt>Vegetables</dt>
                <dd>18.9%</dd>
              </dl>
            </li>
            <li
              style={
                {
                  "--color": CATEGORY_COLORS.fruit,
                  "--width": "12.3%",
                } as React.CSSProperties
              }
            >
              <dl>
                <dt>Fruit</dt>
                <dd>12.3%</dd>
              </dl>
              <ul className={styles.detail}>
                <li>
                  <dl>
                    <dt>Apples</dt>
                    <dd>18.9%</dd>
                  </dl>
                </li>
                <li>
                  <dl>
                    <dt>Stone fruits</dt>
                    <dd>18.9%</dd>
                  </dl>
                </li>
                <li>
                  <dl>
                    <dt>Berries</dt>
                    <dd>18.9%</dd>
                  </dl>
                </li>
                <li>
                  <dl>
                    <dt>Grapes</dt>
                    <dd>18.9%</dd>
                  </dl>
                </li>
              </ul>
            </li>
            <li
              style={
                {
                  "--color": CATEGORY_COLORS["roots-and-tubers"],
                  "--width": "5.9%",
                } as React.CSSProperties
              }
            >
              <dl>
                <dt>Tubers</dt>
                <dd>5.9%</dd>
              </dl>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default FlowInfo;