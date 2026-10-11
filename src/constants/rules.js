export const RULE_META = {
  front_rotation: {
    id: "front_rotation",
    icon: "RotateCw",
    color: "emerald",
  },
  front_priority: {
    id: "front_priority",
    icon: "Eye",
    color: "amber",
  },
  separation: {
    id: "separation",
    icon: "SplitSquareHorizontal",
    color: "rose",
  },
  pairing: {
    id: "pairing",
    icon: "Users",
    color: "indigo",
  },
  fixed: {
    id: "fixed",
    icon: "Lock",
    color: "slate",
  },
};

export const DESK_TYPES = ["single", "double", "triple", "aisle", "empty"];

export function deskCapacity(type) {
  if (type === "single") return 1;
  if (type === "double") return 2;
  if (type === "triple") return 3;
  return 0;
}
