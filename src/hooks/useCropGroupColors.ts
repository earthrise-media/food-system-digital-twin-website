import { CATEGORIES_PROPS } from "@/constants";
import { useControls } from "leva";

export default function useCropGroupColors () {
  const colors = useControls("Crop groups colors", {
    Vegetables: CATEGORIES_PROPS.Vegetables.color,
    Nuts: CATEGORIES_PROPS.Nuts.color,
    Grain: CATEGORIES_PROPS.Grain.color,
    Fruits: CATEGORIES_PROPS.Fruits.color,
    Potatoes: CATEGORIES_PROPS.Potatoes.color,
  });
  return colors;
}
