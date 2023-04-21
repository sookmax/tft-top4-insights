export enum Category {
  augments = "augments",
  traits = "traits",
  units = "units",
}
export const CATEGORIES = [
  Category.units,
  Category.traits,
  Category.augments,
] as const;
