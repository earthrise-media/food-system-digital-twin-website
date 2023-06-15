import { searchAtom } from "@/atoms";
import { useAtomValue } from "jotai";
import { useEffect } from "react";

export default function useKeyPress(targetKey: string, callback: () => void) {
  const search = useAtomValue(searchAtom);
  const downHandler = ({ key }: { key: string}) => {
    if (!search && key === targetKey) {
      callback();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", downHandler);
    return () => {
      window.removeEventListener("keydown", downHandler);
    };
  }, [search]); 
}