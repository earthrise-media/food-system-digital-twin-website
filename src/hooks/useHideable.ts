import classNames from "classnames";
import { useTransition } from "transition-hook";

export const TRANSITION_TIME = 200;

export function useHideable(
  prop: boolean,
  className?: string,
  leaveClassName?: string,
  transitionTime = TRANSITION_TIME
) {
  const { stage, shouldMount } = useTransition(prop, transitionTime);

  const finalClassName = classNames(className || '', {
    [leaveClassName || 'hidden']: stage === "leave",
  });
  const style = {
    "--transition": `${transitionTime}ms`,
  } as React.CSSProperties;

  return { shouldMount, stage, className: finalClassName, style };
}
