import classNames from "classnames";
import { useTransition } from "transition-hook";

export const TRANSITION_TIME = 200;

export function useHideable(
  prop: boolean,
  className?: string,
  hiddenClassName?: string,
  transitionTime = TRANSITION_TIME
) {
  const { stage, shouldMount } = useTransition(prop, transitionTime);
  const finalClassName = (className && hiddenClassName) ? classNames(className, {
    [hiddenClassName]: stage === "leave",
  }) : '';
  const style = {
    "--transition": `${transitionTime}ms`,
  } as React.CSSProperties;

  return { shouldMount, stage, className: finalClassName, style };
}
