import { Category } from "./types";

export const CATEGORIES: Category[] = [
  "grain",
  "nuts",
  "vegetables",
  "fruits",
  "tubbers",
];

export const CATEGORIES_PROPS: Record<
  Category,
  { name: string; color: string }
> = {
  vegetables: {
    name: "Vegetables",
    color: "#0FB5AE",
  },
  nuts: {
    name: "Nuts",
    color: "#4046CA",
  },
  grain: {
    name: "Grain",
    color: "#F68511",
  },
  fruits: {
    name: "Fruits",
    color: "#DE3D82",
  },
  tubbers: {
    name: "Tubers",
    color: "#7E84FA",
  },
};
