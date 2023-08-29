import { AdverseConditions, Category } from "./types";

export const SIDEBAR_WIDTH = 368;

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

export const ADVERSE_CONDITIONS_OPTIONS: {
  value: AdverseConditions;
  label: string;
}[] = [
  { value: "drought", label: "Drought" },
  { value: "heatStress", label: "Heat stress" },
];

export const INITIAL_VIEW_STATE = {
  longitude: -98,
  latitude: 37,
  zoom: 4,
  pitch: 30,
  bearing: 0,
};

export const STRESS_PALETTE = [
  "rgba(232, 214, 194, 1)",
  "rgba(221, 192, 175, 1)",
  "rgba(210, 170, 163, 1)",
  "rgba(193, 151, 154, 1)",
  "rgba(172, 133, 144, 1)",
];
