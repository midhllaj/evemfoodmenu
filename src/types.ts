export type ScreenName =
  | "dashboard"
  | "customer"
  | "builder"
  | "preview"
  | "history"
  | "database"
  | "templates"
  | "settings";

export type CustomerDetails = {
  customerName: string;
  phoneNumber: string;
  eventName: string;
  eventDate: string;
  venue: string;
  guests: string;
  eventType: string;
  notes: string;
};

export type Heading = {
  id: string;
  name: string;
  displayOrder: number;
  visible: boolean;
};

export type Dish = {
  id: string;
  name: string;
  category: string;
  headingId: string;
  price?: string;
  favorite?: boolean;
  parentDishId?: string; // For sub-dishes that belong to a parent dish
  isParent?: boolean; // Indicates this is a parent dish with sub-dishes
};

export type SelectedDish = Dish & {
  quantity?: string;
  remarks?: string;
};

export type MenuTemplate = {
  id: string;
  name: string;
  dishIds: string[];
  headingIds: string[];
};

export type QuotationDraft = {
  customer: CustomerDetails;
  selectedDishes: Record<string, SelectedDish>;
};
