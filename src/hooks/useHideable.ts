import classNames from "classnames";
import { useTransition } from "transition-hook";

export const TRANSITION_TIME = 300;

export function useHideable(
  prop: boolean,
  className?: string,
  leaveClassName?: string,
  enterClassName?: string,
  transitionTime = TRANSITION_TIME
) {
  const { stage, shouldMount } = useTransition(prop, transitionTime);

  const finalClassName = classNames(className || '', {
    [leaveClassName || 'hidden']: stage === "leave",
    [enterClassName || 'enter']: stage === "enter",
  });
  const style = {
    "--transition": `${transitionTime}ms`,
  } as React.CSSProperties;

  return { shouldMount, stage, className: finalClassName, style };
}
