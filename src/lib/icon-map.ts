import {
  Utensils,
  Car,
  ShoppingBag,
  Receipt,
  Repeat,
  MoreHorizontal,
  Home,
  Film,
  HeartPulse,
  GraduationCap,
  Plane,
  Coffee,
  Gift,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export const ICON_OPTIONS = [
  "utensils",
  "car",
  "shopping-bag",
  "receipt",
  "repeat",
  "home",
  "film",
  "heart-pulse",
  "graduation-cap",
  "plane",
  "coffee",
  "gift",
  "wallet",
  "more-horizontal",
] as const;

const ICONS: Record<string, LucideIcon> = {
  utensils: Utensils,
  car: Car,
  "shopping-bag": ShoppingBag,
  receipt: Receipt,
  repeat: Repeat,
  home: Home,
  film: Film,
  "heart-pulse": HeartPulse,
  "graduation-cap": GraduationCap,
  plane: Plane,
  coffee: Coffee,
  gift: Gift,
  wallet: Wallet,
  "more-horizontal": MoreHorizontal,
};

export function getIcon(name: string): LucideIcon {
  return ICONS[name] ?? MoreHorizontal;
}

export const CATEGORY_COLORS = [
  "#f97316",
  "#3b82f6",
  "#ec4899",
  "#ef4444",
  "#8b5cf6",
  "#10b981",
  "#eab308",
  "#06b6d4",
  "#6b7280",
];
