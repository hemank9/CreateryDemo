import { Redis } from "@upstash/redis";
import { relayOrderToPetpooja } from "../lib/petpooja.js";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

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
    status: "active", // active | making | done
    createdAt: Date.now(),
  };

  // Store order with 24hr expiry (86400 seconds)
  await redis.set(`order:${orderId}`, JSON.stringify(order), { ex: 86400 });

  // Add to sorted set so we can fetch all orders sorted by time
  await redis.zadd("orders:active", { score: Date.now(), member: orderId });

  // ── Relay to Petpooja (non-blocking failure — never breaks the customer's order) ──
  const callbackUrl = `${process.env.FRONTEND_URL || "https://createry.cafe"}/api/petpooja-callback`;
  const petpoojaResult = await relayOrderToPetpooja(order, callbackUrl);

  if (petpoojaResult) {
    // Save Petpooja's order reference back onto our order for later lookups
    order.petpoojaOrderId = petpoojaResult.orderID || petpoojaResult.order_id || null;
    await redis.set(`order:${orderId}`, JSON.stringify(order), { ex: 86400 });
  }

  return res.status(200).json({ success: true, orderId, petpoojaRelayed: !!petpoojaResult });
}
