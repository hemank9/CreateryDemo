// api/_menu-data.js
// Single source of truth for the menu, used to build the Petpooja menu push payload.
// Keep this in sync with the MENU array in index.html.
//
// Categories map to Petpooja categories. Variation groups (x: {...}) become
// Petpooja "variations". The Affogato add-on becomes a Petpooja "addon group".

export const CATEGORIES = [
  { id: "cat_hot_coffee", name: "Hot Coffee" },
  { id: "cat_cold_coffee", name: "Cold Coffee" },
  { id: "cat_cold_beverages", name: "Cold Beverages" },
  { id: "cat_milk", name: "Milk Drinks" },
  { id: "cat_matcha", name: "Matcha" },
  { id: "cat_food", name: "Food" },
  { id: "cat_desserts", name: "Desserts" },
];

const CAT_MAP = {
  "hot-coffee": "cat_hot_coffee",
  "cold-coffee": "cat_cold_coffee",
  "cold-beverages": "cat_cold_beverages",
  milk: "cat_milk",
  matcha: "cat_matcha",
  food: "cat_food",
  desserts: "cat_desserts",
};

// Add-on groups (only Affogato has one right now)
export const ADDON_GROUPS = [
  {
    id: "addon_affogato",
    name: "Affogato Add-ons",
    items: [{ id: "addon_nutella_cookie", name: "Nutella Cookie", price: "60.00" }],
  },
];

// Full menu — id matches the `id` used in index.html's MENU array.
// `x` mirrors the variation groups used in index.html for customisation.
export const MENU = [
  // HOT COFFEE
  { id: 1, n: "Sabrina's Espresso", p: 70, c: "hot-coffee" },
  { id: 2, n: "Hot Americano", p: 90, c: "hot-coffee" },
  { id: 3, n: "Old School Flat White", p: 120, c: "hot-coffee" },
  { id: 4, n: "Gur Latte", p: 120, c: "hot-coffee", x: { flavour: ["Classic", "Vanilla +30", "Caramel +30", "Hazelnut +30"] } },
  { id: 5, n: "Cappuccino", p: 120, c: "hot-coffee", x: { flavour: ["Classic", "Vanilla +30", "Caramel +30", "Hazelnut +30"] } },
  { id: 6, n: "Mocha", p: 140, c: "hot-coffee", x: { variant: ["White", "Dark"] } },

  // COLD COFFEE
  { id: 7, n: "Iced Americano", p: 90, c: "cold-coffee", x: { extras: ["No lemon", "With lemon"] } },
  { id: 8, n: "Espresso Tonic", p: 130, c: "cold-coffee" },
  { id: 9, n: "Flavoured Espresso Tonic", p: 150, c: "cold-coffee", x: { flavour: ["Cranberry", "Orange", "Surprise me"] } },
  { id: 10, n: "Redbull (Wings) Espresso", p: 230, c: "cold-coffee" },
  { id: 11, n: "Central Perk Iced Latte", p: 120, c: "cold-coffee" },
  { id: 12, n: "Classic Cold Coffee", p: 120, c: "cold-coffee" },
  { id: 13, n: "Iced Mocha", p: 140, c: "cold-coffee", x: { extras: ["Regular", "Add dark"] } },
  { id: 14, n: "Hazelnut / Vanilla Cold Coffee", p: 150, c: "cold-coffee", x: { flavour: ["Hazelnut", "Vanilla"] } },
  { id: 15, n: "Popcorn / Cheesecake Cold Coffee", p: 150, c: "cold-coffee", x: { flavour: ["Popcorn", "Cheesecake"] } },
  { id: 16, n: "Vietnamese Iced Coffee", p: 170, c: "cold-coffee" },

  // COLD BEVERAGES
  { id: 17, n: "Tangerine Mocktail", p: 90, c: "cold-beverages" },
  { id: 18, n: "Drake's Passionfruit Mocktail", p: 90, c: "cold-beverages" },
  { id: 19, n: "Cranberry Mocktail", p: 90, c: "cold-beverages" },
  { id: 20, n: "Sleepy Redbull Mocktail", p: 210, c: "cold-beverages" },
  { id: 21, n: "Crispy Water", p: 0, c: "cold-beverages" },
  { id: 22, n: "Raspberry Iced Tea", p: 80, c: "cold-beverages" },
  { id: 23, n: "Mango Mint Iced Tea", p: 80, c: "cold-beverages" },
  { id: 24, n: "Fresh Lime Soda", p: 90, c: "cold-beverages" },
  { id: 25, n: "Peach Iced Tea", p: 80, c: "cold-beverages" },
  { id: 26, n: "Lemon Iced Tea", p: 80, c: "cold-beverages" },
  { id: 27, n: "Ghar ka OG Nimboo Paani", p: 40, c: "cold-beverages" },

  // MILK
  { id: 28, n: "Hot Chocolate", p: 90, c: "milk", x: { flavour: ["Classic", "Vanilla +30", "Hazelnut +30"] } },
  { id: 29, n: "Dadi's Fav Haldi Doodh", p: 60, c: "milk" },
  { id: 30, n: "Chocolate Milkshake", p: 160, c: "milk", trial: true },
  { id: 31, n: "Biscoff Milkshake", p: 180, c: "milk" },
  { id: 71, n: "Affogato", p: 120, c: "milk", addonGroup: "addon_affogato" },
  { id: 32, n: "Anusha's Bournvita", p: 70, c: "milk", x: { temp: ["Iced", "Hot"] } },

  // MATCHA
  { id: 33, n: "Matcha Latte", p: 170, c: "matcha", x: { temp: ["Iced", "Hot"], flavour: ["Classic", "Vanilla +30", "Hazelnut +30"] } },
  { id: 34, n: "Dirty Dancing Matcha", p: 210, c: "matcha" },

  // FOOD
  { id: 35, n: "Hummus Platter", p: 160, c: "food" },
  { id: 36, n: "Honey x Nimbu Hummus Salad", p: 140, c: "food" },
  { id: 37, n: "Pesto Paneer Salad", p: 160, c: "food" },
  { id: 38, n: "Tandoori Paneer Salad", p: 160, c: "food" },
  { id: 39, n: "Crispy Peanut Chaat", p: 120, c: "food" },

  // DESSERTS
  { id: 42, n: "Choco Muffin", p: 40, c: "desserts" },
  { id: 43, n: "Chocolate Cookie", p: 50, c: "desserts" },
  { id: 44, n: "Nutella Cookie", p: 50, c: "desserts" },
  { id: 45, n: "Chocolate Brownie", p: 90, c: "desserts" },
  { id: 46, n: "Sea Salt Caramel Brownie", p: 90, c: "desserts" },
  { id: 47, n: "Lemon Cheesecake", p: 120, c: "desserts" },
  { id: 48, n: "Chocolate Cheesecake", p: 120, c: "desserts" },
];

export function getCategoryId(c) {
  return CAT_MAP[c] || "cat_food";
}
