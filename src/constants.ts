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
    color: "#5AA155",
  },
  Nuts: {
    name: "Nuts",
    color: "#EE6BB1",
  },
  Grain: {
    name: "Grain",
    color: "#F68511",
  },
  Fruits: {
    name: "Fruits",
    color: "#D23130",
  },
  Potatoes: {
    name: "Tubers",
    color: "#92583A",
  },
};

export const CATEGORIES_COLORS = Object.fromEntries(Object.entries(CATEGORIES_PROPS).map(
  ([cat, { color }]) => [cat, color]
));

export const TOP_COUNTIES_NUMBER = 5;

export const ADVERSE_CONDITIONS_OPTIONS: {
  value: AdverseConditions;
  label: string;
  tilesUrl: string;
}[] = [
  {
    value: "drought",
    label: "Drought",
    tilesUrl:
      "https://food-system-digital-twin-public.s3.us-east-2.amazonaws.com/drought-tiles/{z}/{x}/{y}.png",
  },
  {
    value: "heatStress",
    label: "Heat stress",
    tilesUrl:
      "https://food-system-digital-twin-public.s3.us-east-2.amazonaws.com/heat-tiles/{z}/{x}/{y}.png",
  },
];

export const INITIAL_VIEW_STATE = {
  longitude: -98,
  latitude: 37,
  zoom: 4,
  pitch: 30,
  bearing: 0,
};

export const STRESS_PALETTE = [
  "#f5f2ed",
  "#f5f2ed",
  "#ffd8a7",
  "#f1a484",
  "#98569d",
];
