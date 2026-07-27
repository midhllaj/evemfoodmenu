import { Dish, Heading, MenuTemplate } from "../types";

export const categories = [
  "Kerala Sadya",
  "Arabian",
  "Biriyani",
  "Seafood",
  "Chicken",
  "Beef",
  "Fish",
  "Mutton",
  "Prawns",
  "Chinese",
  "Vegetarian",
  "Rice",
  "Curries",
  "Breads",
  "Snacks",
  "Starters",
  "Soups",
  "Salads",
  "Desserts",
  "Ice Cream",
  "Juices",
  "Welcome Drinks",
  "Tea & Coffee",
  "Milkshakes",
  "Fruits",
  "BBQ",
  "Live Counters"
];

export const seedHeadings: Heading[] = [
  { id: "fresh-juice-live", name: "Fresh Juice Live", displayOrder: 1, visible: true },
  { id: "starters", name: "Starters", displayOrder: 2, visible: true },
  { id: "food-menu", name: "Food Menu", displayOrder: 3, visible: true },
  { id: "salads-bar", name: "Salads Bar Counter", displayOrder: 4, visible: true },
  { id: "dosa-counter", name: "Dosa Counter", displayOrder: 5, visible: true },
  { id: "desserts", name: "Desserts", displayOrder: 6, visible: true },
  { id: "herbal-tea", name: "Herbal Tea Counter", displayOrder: 7, visible: true }
];

export const seedDishes: Dish[] = [
  { id: "pineapple", name: "Pineapple", category: "Juices", headingId: "fresh-juice-live" },
  { id: "watermelon", name: "Watermelon", category: "Juices", headingId: "fresh-juice-live" },
  { id: "orange", name: "Orange", category: "Juices", headingId: "fresh-juice-live" },
  { id: "grape", name: "Grape", category: "Juices", headingId: "fresh-juice-live" },
  { id: "mango", name: "Mango", category: "Juices", headingId: "fresh-juice-live" },
  { id: "mint-lime", name: "Mint Lime", category: "Welcome Drinks", headingId: "fresh-juice-live" },
  { id: "fresh-lime", name: "Fresh Lime", category: "Welcome Drinks", headingId: "fresh-juice-live" },
  { id: "chicken-nuggets", name: "Chicken Nuggets", category: "Starters", headingId: "starters" },
  { id: "veg-roll", name: "Veg Roll", category: "Starters", headingId: "starters" },
  { id: "chicken-golden-fry", name: "Chicken Golden Fry", category: "Chicken", headingId: "food-menu", favorite: true },
  { id: "chicken-biriyani", name: "Chicken Biriyani", category: "Biriyani", headingId: "food-menu", favorite: true },
  { id: "chicken-mandi", name: "Chicken Mandi", category: "Arabian", headingId: "food-menu", favorite: true },
  { id: "alfaham", name: "Alfaham", category: "Arabian", headingId: "food-menu", favorite: true },
  { id: "neypathal", name: "Neypathal", category: "Breads", headingId: "food-menu" },
  { id: "coin-porotta", name: "Coin Porotta", category: "Breads", headingId: "food-menu" },
  { id: "fish-molly", name: "Fish Molly", category: "Fish", headingId: "food-menu" },
  { id: "prawns-roast", name: "Prawns Roast", category: "Prawns", headingId: "food-menu" },
  { id: "beef-ularthiyathu", name: "Beef Ularthiyathu", category: "Beef", headingId: "food-menu" },
  { id: "mutton-korma", name: "Mutton Korma", category: "Mutton", headingId: "food-menu" },
  { id: "green-salad", name: "Green Salad", category: "Salads", headingId: "salads-bar" },
  { id: "russian-salad", name: "Russian Salad", category: "Salads", headingId: "salads-bar" },
  { id: "masala-dosa", name: "Masala Dosa", category: "Dosa Counter", headingId: "dosa-counter" },
  { id: "ghee-roast", name: "Ghee Roast", category: "Dosa Counter", headingId: "dosa-counter" },
  { id: "palada-payasam", name: "Palada Payasam", category: "Desserts", headingId: "desserts" },
  { id: "tender-coconut-pudding", name: "Tender Coconut Pudding", category: "Desserts", headingId: "desserts" },
  { id: "ice-cream", name: "Ice Cream", category: "Ice Cream", headingId: "desserts" },
  { id: "herbal-tea", name: "Herbal Tea", category: "Tea & Coffee", headingId: "herbal-tea" },
  
  // Kerala Sadya - Parent Dish
  { id: "kerala-sadya", name: "Kerala Sadya (Full)", category: "Kerala Sadya", headingId: "food-menu", isParent: true, favorite: true },
  
  // Kerala Sadya Sub-Dishes
  { id: "rice", name: "Rice", category: "Kerala Sadya", headingId: "food-menu", parentDishId: "kerala-sadya" },
  { id: "parippu", name: "Parippu", category: "Kerala Sadya", headingId: "food-menu", parentDishId: "kerala-sadya" },
  { id: "sambar", name: "Sambar", category: "Kerala Sadya", headingId: "food-menu", parentDishId: "kerala-sadya" },
  { id: "rasam", name: "Rasam", category: "Kerala Sadya", headingId: "food-menu", parentDishId: "kerala-sadya" },
  { id: "moru", name: "Moru (Buttermilk)", category: "Kerala Sadya", headingId: "food-menu", parentDishId: "kerala-sadya" },
  { id: "avial", name: "Avial", category: "Kerala Sadya", headingId: "food-menu", parentDishId: "kerala-sadya" },
  { id: "thoran", name: "Thoran", category: "Kerala Sadya", headingId: "food-menu", parentDishId: "kerala-sadya" },
  { id: "kaalan", name: "Kaalan", category: "Kerala Sadya", headingId: "food-menu", parentDishId: "kerala-sadya" },
  { id: "olan", name: "Olan", category: "Kerala Sadya", headingId: "food-menu", parentDishId: "kerala-sadya" },
  { id: "pachadi", name: "Pachadi", category: "Kerala Sadya", headingId: "food-menu", parentDishId: "kerala-sadya" },
  { id: "kichadi", name: "Kichadi", category: "Kerala Sadya", headingId: "food-menu", parentDishId: "kerala-sadya" },
  { id: "erissery", name: "Erissery", category: "Kerala Sadya", headingId: "food-menu", parentDishId: "kerala-sadya" },
  { id: "pappadam", name: "Pappadam", category: "Kerala Sadya", headingId: "food-menu", parentDishId: "kerala-sadya" },
  { id: "banana", name: "Banana", category: "Kerala Sadya", headingId: "food-menu", parentDishId: "kerala-sadya" },
  { id: "pickle", name: "Pickle", category: "Kerala Sadya", headingId: "food-menu", parentDishId: "kerala-sadya" },
  { id: "upperi", name: "Upperi (Banana Chips)", category: "Kerala Sadya", headingId: "food-menu", parentDishId: "kerala-sadya" },
  { id: "sharkara-varatti", name: "Sharkara Varatti (Jaggery Banana)", category: "Kerala Sadya", headingId: "food-menu", parentDishId: "kerala-sadya" },
  { id: "payasam", name: "Payasam", category: "Kerala Sadya", headingId: "desserts", parentDishId: "kerala-sadya" },
  { id: "ghee", name: "Ghee", category: "Kerala Sadya", headingId: "food-menu", parentDishId: "kerala-sadya" }
];

export const seedTemplates: MenuTemplate[] = [
  {
    id: "wedding",
    name: "Wedding",
    headingIds: ["fresh-juice-live", "starters", "food-menu", "desserts"],
    dishIds: ["mint-lime", "chicken-nuggets", "chicken-biriyani", "alfaham", "palada-payasam"]
  },
  {
    id: "sadya-package",
    name: "Sadya Package",
    headingIds: ["food-menu", "desserts"],
    dishIds: ["kerala-sadya"] // Just the parent dish ID
  },
  {
    id: "ramadan",
    name: "Ramadan",
    headingIds: ["fresh-juice-live", "starters", "food-menu", "desserts", "herbal-tea"],
    dishIds: ["fresh-lime", "veg-roll", "chicken-mandi", "alfaham", "tender-coconut-pudding", "herbal-tea"]
  }
];
