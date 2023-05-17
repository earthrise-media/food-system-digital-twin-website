import { useEffect } from "react";

export default function useKeyPress(targetKey: string, callback: () => void) {
  function downHandler({ key }: { key: string}): void {
    if (key === targetKey) {
      callback();
    }
  }

  useEffect(() => {
    window.addEventListener("keydown", downHandler);
    return () => {
      window.removeEventListener("keydown", downHandler);
    };
  }, []); // Empty array ensures that effect is only run on mount and unmount
}