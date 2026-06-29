import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const PETPOOJA_SAVE_ORDER_URL =
  "https://qle1yy2ydc.execute-api.ap-southeast-1.amazonaws.com/V1/save_order";

// ── Menu data (kept inline so this file has zero external imports) ──
const MENU = [
  { id: 1, n: "Sabrina's Espresso", p: 70 },
  { id: 2, n: "Hot Americano", p: 90 },
  { id: 3, n: "Old School Flat White", p: 120 },
  { id: 4, n: "Gur Latte", p: 120 },
  { id: 5, n: "Cappuccino", p: 120 },
  { id: 6, n: "Mocha", p: 140 },
  { id: 7, n: "Iced Americano", p: 90 },
  { id: 8, n: "Espresso Tonic", p: 130 },
  { id: 9, n: "Flavoured Espresso Tonic", p: 150 },
  { id: 10, n: "Redbull (Wings) Espresso", p: 230 },
  { id: 11, n: "Central Perk Iced Latte", p: 120 },
  { id: 12, n: "Classic Cold Coffee", p: 120 },
  { id: 13, n: "Iced Mocha", p: 140 },
  { id: 14, n: "Hazelnut / Vanilla Cold Coffee", p: 150 },
  { id: 15, n: "Popcorn / Cheesecake Cold Coffee", p: 150 },
  { id: 16, n: "Vietnamese Iced Coffee", p: 170 },
  { id: 17, n: "Tangerine Mocktail", p: 90 },
  { id: 18, n: "Drake's Passionfruit Mocktail", p: 90 },
  { id: 19, n: "Cranberry Mocktail", p: 90 },
  { id: 20, n: "Sleepy Redbull Mocktail", p: 210 },
  { id: 21, n: "Crispy Water", p: 0 },
  { id: 22, n: "Raspberry Iced Tea", p: 80 },
  { id: 23, n: "Mango Mint Iced Tea", p: 80 },
  { id: 24, n: "Fresh Lime Soda", p: 90 },
  { id: 25, n: "Peach Iced Tea", p: 80 },
  { id: 26, n: "Lemon Iced Tea", p: 80 },
  { id: 27, n: "Ghar ka OG Nimboo Paani", p: 40 },
  { id: 28, n: "Hot Chocolate", p: 90 },
  { id: 29, n: "Dadi's Fav Haldi Doodh", p: 60 },
  { id: 30, n: "Chocolate Milkshake", p: 160 },
  { id: 31, n: "Biscoff Milkshake", p: 180 },
  { id: 71, n: "Affogato", p: 120 },
  { id: 32, n: "Anusha's Bournvita", p: 70 },
  { id: 33, n: "Matcha Latte", p: 170 },
  { id: 34, n: "Dirty Dancing Matcha", p: 210 },
  { id: 35, n: "Hummus Platter", p: 160 },
  { id: 36, n: "Honey x Nimbu Hummus Salad", p: 140 },
  { id: 37, n: "Pesto Paneer Salad", p: 160 },
  { id: 38, n: "Tandoori Paneer Salad", p: 160 },
  { id: 39, n: "Crispy Peanut Chaat", p: 120 },
  { id: 42, n: "Choco Muffin", p: 40 },
  { id: 43, n: "Chocolate Cookie", p: 50 },
  { id: 44, n: "Nutella Cookie", p: 50 },
  { id: 45, n: "Chocolate Brownie", p: 90 },
  { id: 46, n: "Sea Salt Caramel Brownie", p: 90 },
  { id: 47, n: "Lemon Cheesecake", p: 120 },
  { id: 48, n: "Chocolate Cheesecake", p: 120 },
];

function resolveItemId(itemName) {
  const match = MENU.find(
    (m) => m.n.toLowerCase() === String(itemName).toLowerCase()
  );
  return match ? String(match.id) : "0";
}

function buildPetpoojaPayload(order, callbackUrl) {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const createdOn = `${dateStr} ${timeStr}`;

  const orderItems = order.items.map((item) => {
    const unitPrice = Number(item.price) || 0;
    const qty = Number(item.qty) || 1;
    const itemId = resolveItemId(item.name);

    const itemTotal = unitPrice * qty;
    const cgstAmt = (itemTotal * 0.025).toFixed(2);
    const sgstAmt = (itemTotal * 0.025).toFixed(2);

    const orderItem = {
      id: itemId,
      name: item.name,
      tax_inclusive: false,
      item_discount: "",
      price: unitPrice.toFixed(2),
      final_price: unitPrice.toFixed(2),
      quantity: String(qty),
      gst_liability: "restaurant",
      item_tax: [
        { id: "1", name: "CGST", tax_percentage: "2.5", amount: cgstAmt },
        { id: "2", name: "SGST", tax_percentage: "2.5", amount: sgstAmt },
      ],
      variation_name: item.variationName || "",
      variation_id: item.variationId || "",
    };

    if (item.addons && item.addons.length) {
      orderItem.addon_items = item.addons.map((a) => ({
        id: String(a.id || "addon_nutella_cookie"),
        name: a.name,
        price: Number(a.price || 0).toFixed(2),
        quantity: String(a.qty || 1),
      }));
    }

    return orderItem;
  });

  const subtotal = order.items.reduce(
    (s, i) => s + Number(i.price) * Number(i.qty),
    0
  );
  const taxTotal = subtotal * 0.05;
  const total = subtotal + taxTotal;

  return {
    app_key: process.env.PETPOOJA_APP_KEY,
    app_secret: process.env.PETPOOJA_APP_SECRET,
    access_token: process.env.PETPOOJA_ACCESS_TOKEN,
    restID: process.env.PETPOOJA_REST_ID,
    order: {
      orderID: order.orderId,
      preorder_date: dateStr,
      preorder_time: timeStr,
      advanced_order: "N",
      order_type: "P",
      total: total.toFixed(2),
      discount_total: "0",
      discount_type: "F",
      tax_total: taxTotal.toFixed(2),
      description: order.notes || "",
      created_on: createdOn,
      dc_tax_percentage: "0",
      pc_tax_percentage: "0",
      payment_type: "COD",
      delivery_charges: "0",
      urgent_order: false,
      enable_delivery: 0,
      callback_url: callbackUrl,
      packing_charges: "0",
      service_charge: "0",
    },
    customer: {
      name: order.name,
      phone: order.phone || "",
      email: order.email || "",
      address: "Createry Café — Anant National University",
      latitude: "",
      longitude: "",
    },
    order_items: orderItems,
    tax_details: [
      {
        id: "1",
        title: "CGST",
        type: "P",
        price: "2.5%",
        tax: (taxTotal / 2).toFixed(2),
        restaurant_liable_amt: (taxTotal / 2).toFixed(2),
      },
      {
        id: "2",
        title: "SGST",
        type: "P",
        price: "2.5%",
        tax: (taxTotal / 2).toFixed(2),
        restaurant_liable_amt: (taxTotal / 2).toFixed(2),
      },
    ],
  };
}

async function relayOrderToPetpooja(order, callbackUrl) {
  try {
    const payload = buildPetpoojaPayload(order, callbackUrl);
    const res = await fetch(PETPOOJA_SAVE_ORDER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("Petpooja relay failed:", res.status, data);
      return null;
    }
    console.log("Petpooja relay success:", data);
    return data;
  } catch (err) {
    console.error("Petpooja relay error:", err);
    return null;
  }
}

// ── Main route handler ──
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { name, phone, slot, items, total, paymentId, razorpayOrderId } = req.body;

  if (!name || !items || !items.length || !total) {
    return res.status(400).json({ error: "Missing required order fields" });
  }

  const orderId = `CR8-${Date.now().toString().slice(-6)}`;
  const order = {
    orderId,
    name,
    phone: phone || "",
    slot: slot || "ASAP",
    items,
    total,
    paymentId: paymentId || null,
    razorpayOrderId: razorpayOrderId || null,
    status: "active",
    createdAt: Date.now(),
  };

  await redis.set(`order:${orderId}`, JSON.stringify(order), { ex: 86400 });
  await redis.zadd("orders:active", { score: Date.now(), member: orderId });

  const callbackUrl = `${process.env.FRONTEND_URL || "https://createry.cafe"}/api/petpooja-callback`;
  const petpoojaResult = await relayOrderToPetpooja(order, callbackUrl);

  if (petpoojaResult) {
    order.petpoojaOrderId = petpoojaResult.orderID || petpoojaResult.order_id || null;
    await redis.set(`order:${orderId}`, JSON.stringify(order), { ex: 86400 });
  }

  return res.status(200).json({ success: true, orderId, petpoojaRelayed: !!petpoojaResult });
}
