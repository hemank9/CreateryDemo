import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const PETPOOJA_PUSHMENU_URL = "https://developerapi.petpooja.com/pushmenu";

const CATEGORIES = [
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

const ADDON_GROUPS = [
  {
    id: "addon_affogato",
    name: "Affogato Add-ons",
    items: [{ id: "addon_nutella_cookie", name: "Nutella Cookie", price: "60.00" }],
  },
];

const MENU = [
  { id: 1, n: "Sabrina's Espresso", p: 70, c: "hot-coffee" },
  { id: 2, n: "Hot Americano", p: 90, c: "hot-coffee" },
  { id: 3, n: "Old School Flat White", p: 120, c: "hot-coffee" },
  { id: 4, n: "Gur Latte", p: 120, c: "hot-coffee", x: { flavour: ["Classic", "Vanilla +30", "Caramel +30", "Hazelnut +30"] } },
  { id: 5, n: "Cappuccino", p: 120, c: "hot-coffee", x: { flavour: ["Classic", "Vanilla +30", "Caramel +30", "Hazelnut +30"] } },
  { id: 6, n: "Mocha", p: 140, c: "hot-coffee", x: { variant: ["White", "Dark"] } },
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
  { id: 28, n: "Hot Chocolate", p: 90, c: "milk", x: { flavour: ["Classic", "Vanilla +30", "Hazelnut +30"] } },
  { id: 29, n: "Dadi's Fav Haldi Doodh", p: 60, c: "milk" },
  { id: 30, n: "Chocolate Milkshake", p: 160, c: "milk" },
  { id: 31, n: "Biscoff Milkshake", p: 180, c: "milk" },
  { id: 71, n: "Affogato", p: 120, c: "milk", addonGroup: "addon_affogato" },
  { id: 32, n: "Anusha's Bournvita", p: 70, c: "milk", x: { temp: ["Iced", "Hot"] } },
  { id: 33, n: "Matcha Latte", p: 170, c: "matcha", x: { temp: ["Iced", "Hot"], flavour: ["Classic", "Vanilla +30", "Hazelnut +30"] } },
  { id: 34, n: "Dirty Dancing Matcha", p: 210, c: "matcha" },
  { id: 35, n: "Hummus Platter", p: 160, c: "food" },
  { id: 36, n: "Honey x Nimbu Hummus Salad", p: 140, c: "food" },
  { id: 37, n: "Pesto Paneer Salad", p: 160, c: "food" },
  { id: 38, n: "Tandoori Paneer Salad", p: 160, c: "food" },
  { id: 39, n: "Crispy Peanut Chaat", p: 120, c: "food" },
  { id: 42, n: "Choco Muffin", p: 40, c: "desserts" },
  { id: 43, n: "Chocolate Cookie", p: 50, c: "desserts" },
  { id: 44, n: "Nutella Cookie", p: 50, c: "desserts" },
  { id: 45, n: "Chocolate Brownie", p: 90, c: "desserts" },
  { id: 46, n: "Sea Salt Caramel Brownie", p: 90, c: "desserts" },
  { id: 47, n: "Lemon Cheesecake", p: 120, c: "desserts" },
  { id: 48, n: "Chocolate Cheesecake", p: 120, c: "desserts" },
];

function getCategoryId(c) {
  return CAT_MAP[c] || "cat_food";
}

function buildMenuPayload() {
  const categories = CATEGORIES.map((cat) => ({
    categoryid: cat.id,
    categoryname: cat.name,
    active: "1",
  }));

  const items = MENU.map((item) => {
    const variationGroups = [];
    if (item.x) {
      Object.entries(item.x).forEach(([groupKey, options]) => {
        variationGroups.push({
          groupname: groupKey,
          variations: options.map((opt, i) => {
            const m = opt.match(/\+(\d+)/);
            const extra = m ? Number(m[1]) : 0;
            return {
              id: `${item.id}_${groupKey}_${i}`,
              name: opt.replace(/\s*\+\d+/, ""),
              price: (item.p + extra).toFixed(2),
            };
          }),
        });
      });
    }

    return {
      itemid: String(item.id),
      itemname: item.n,
      price: item.p.toFixed(2),
      categoryid: getCategoryId(item.c),
      active: "1",
      item_addon_group_id: item.addonGroup || "",
      variation_groups: variationGroups,
    };
  });

  return {
    app_key: process.env.PETPOOJA_APP_KEY,
    app_secret: process.env.PETPOOJA_APP_SECRET,
    access_token: process.env.PETPOOJA_ACCESS_TOKEN,
    restID: process.env.PETPOOJA_REST_ID,
    categories,
    items,
    addongroups: ADDON_GROUPS.map((g) => ({
      addongroupid: g.id,
      addongroupname: g.name,
      addongroupitems: g.items.map((i) => ({
        addonitemid: i.id,
        addonitemname: i.name,
        addonitemprice: i.price,
        active: "1",
      })),
    })),
  };
}

export default async function handler(req, res) {
  if (req.query.key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const payload = buildMenuPayload();

    const r = await fetch(PETPOOJA_PUSHMENU_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await r.json().catch(() => ({}));

    if (!r.ok) {
      return res.status(500).json({ error: "Menu push failed", status: r.status, result });
    }

    const mapping = {};
    MENU.forEach((item) => {
      mapping[item.id] = String(item.id);
    });

    await redis.set("petpooja:item-mapping", JSON.stringify(mapping));
    await redis.set(
      "petpooja:last-menu-push",
      JSON.stringify({ pushedAt: Date.now(), itemCount: MENU.length, response: result })
    );

    return res.status(200).json({ success: true, itemCount: MENU.length, petpoojaResponse: result });
  } catch (err) {
    console.error("Menu push error:", err);
    return res.status(500).json({ error: err.message });
  }
}
