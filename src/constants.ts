import { Category } from "./types";

export const CATEGORIES: Category[] = [
  "Grain",
  "Nuts",
  "Vegetables",
  "Fruits",
  "Potatoes",
];

export const CATEGORIES_PROPS: Record<
  Category,
  { name: string; color: string }
> = {
  Vegetables: {
    name: "Vegetables",
    color: "#0FB5AE",
  },
  Nuts: {
    name: "Nuts",
    color: "#4046CA",
  },
  Grain: {
    name: "Grain",
    color: "#F68511",
  },
  Fruits: {
    name: "Fruits",
    color: "#DE3D82",
  },
  Potatoes: {
    name: "Tubers",
    color: "#7E84FA",
  },
};

export const TOP_COUNTIES_NUMBER = 5;

export const NUM_COUNTIES = 3108;