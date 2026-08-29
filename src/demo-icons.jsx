import {
  Bike,
  Boxes,
  Building2,
  Calculator,
  CalendarCheck2,
  CalendarClock,
  FileQuestion,
  Headphones,
  MessageCircleQuestion,
  SearchCheck,
  ShoppingBag,
  ShoppingCart,
  Siren,
  Stethoscope,
  Truck,
  UserPlus,
  UtensilsCrossed,
  Wrench,
} from "lucide-react";

const ICONS = {
  bike: Bike,
  boxes: Boxes,
  building: Building2,
  calculator: Calculator,
  "calendar-check": CalendarCheck2,
  "calendar-clock": CalendarClock,
  "file-question": FileQuestion,
  headphones: Headphones,
  "message-question": MessageCircleQuestion,
  "search-check": SearchCheck,
  "shopping-bag": ShoppingBag,
  "shopping-cart": ShoppingCart,
  siren: Siren,
  stethoscope: Stethoscope,
  truck: Truck,
  "user-plus": UserPlus,
  utensils: UtensilsCrossed,
  wrench: Wrench,
};

export function iconForDemo(icon) {
  return ICONS[icon] || MessageCircleQuestion;
}
