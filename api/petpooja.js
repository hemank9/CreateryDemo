// api/_petpooja.js
// Helper to build and send orders to Petpooja's Save Order API.
// Imported by save-order.js — not a route itself.

import { Redis } from "@upstash/redis";
import { MENU } from "./_menu-data.js";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const PETPOOJA_SAVE_ORDER_URL = "https://qle1yy2ydc.execute-api.ap-southeast-1.amazonaws.com/V1/save_order";

// Look up an item's Petpooja ID by matching its name against our menu data.
// Falls back to the mapping saved during push-menu, then to a safe default.
async function resolvePetpoojaItemId(itemName) {
  const menuMatch = MENU.find(
    (m) => m.n.toLowerCase() === String(itemName).toLowerCase()
  );
  if (menuMatch) return String(menuMatch.id);

  try {
    const raw = await redis.get("petpooja:item-mapping");
    const mapping = raw ? (typeof raw === "string" ? JSON.parse(raw) : raw) : {};
    const found = Object.entries(mapping).find(
      ([, v]) => String(v).toLowerCase() === String(itemName).toLowerCase()
    );
    if (found) return found[1];
  } catch (e) {
    console.warn("Could not read item mapping:", e);
  }

  return "0"; // unknown item — Petpooja will likely reject; logged for follow-up
}

/**
 * Builds a Petpooja-compliant order payload from our internal order object.
 * @param {Object} order - our internal order object (see save-order.js)
 * @param {string} callbackUrl - URL Petpooja will call with status updates
 */
async function buildPetpoojaPayload(order, callbackUrl) {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");

  const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const createdOn = `${dateStr} ${timeStr}`;

  // Build order_items array — handle addons, variations, and per-item tax
  const orderItems = await Promise.all(
    order.items.map(async (item) => {
      const unitPrice = Number(item.price) || 0;
      const qty = Number(item.qty) || 1;
      const itemId = await resolvePetpoojaItemId(item.name);

      // 5% GST split into CGST 2.5% + SGST 2.5% (adjust if your actual rate differs)
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

      // Add-ons (e.g. Affogato's Nutella Cookie add-on)
      if (item.addons && item.addons.length) {
        orderItem.addon_items = item.addons.map((a) => ({
          id: String(a.id || "addon_nutella_cookie"),
          name: a.name,
          price: Number(a.price || 0).toFixed(2),
          quantity: String(a.qty || 1),
        }));
      }

      return orderItem;
    })
  );

  const subtotal = order.items.reduce(
    (s, i) => s + Number(i.price) * Number(i.qty),
    0
  );
  const taxTotal = subtotal * 0.05; // 5% total (2.5 CGST + 2.5 SGST)
  const total = subtotal + taxTotal;

  const payload = {
    app_key: process.env.PETPOOJA_APP_KEY,
    app_secret: process.env.PETPOOJA_APP_SECRET,
    access_token: process.env.PETPOOJA_ACCESS_TOKEN,

    restID: process.env.PETPOOJA_REST_ID,

    order: {
      orderID: order.orderId,
      preorder_date: dateStr,
      preorder_time: timeStr,
      advanced_order: "N",
      order_type: "P", // Parcel/pickup — matches your "pickup counter" flow
      total: total.toFixed(2),
      discount_total: "0",
      discount_type: "F",
      tax_total: taxTotal.toFixed(2),
      description: order.notes || "",
      created_on: createdOn,
      dc_tax_percentage: "0",
      pc_tax_percentage: "0",
      payment_type: "COD", // change to "ONLINE" once online payments are added
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
      address: "Createry Café — Anant National University", // pickup, not delivery
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

  return payload;
}

/**
 * Sends the order to Petpooja. Never throws — logs and returns null on failure
 * so a Petpooja outage never blocks a customer's order from being saved.
 */
async function relayOrderToPetpooja(order, callbackUrl) {
  try {
    const payload = await buildPetpoojaPayload(order, callbackUrl);

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

export { buildPetpoojaPayload, relayOrderToPetpooja };
