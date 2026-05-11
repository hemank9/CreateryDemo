import { Redis } from "@upstash/redis";

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

  const { orderId, status } = req.body;

  if (!orderId || !["active", "making", "done"].includes(status)) {
    return res.status(400).json({ error: "Invalid orderId or status" });
  }

  const raw = await redis.get(`order:${orderId}`);
  if (!raw) return res.status(404).json({ error: "Order not found" });

  const order = typeof raw === "string" ? JSON.parse(raw) : raw;
  order.status = status;

  // Keep 24hr expiry on update too
  await redis.set(`order:${orderId}`, JSON.stringify(order), { ex: 86400 });

  // If marked done, remove from active set
  if (status === "done") {
    await redis.zrem("orders:active", orderId);
  }

  return res.status(200).json({ success: true, order });
}
