import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  // Get all order IDs from sorted set (newest last)
  const orderIds = await redis.zrange("orders:active", 0, -1);

  if (!orderIds || orderIds.length === 0) {
    return res.status(200).json({ orders: [] });
  }

  // Fetch all orders in parallel
  const orderData = await Promise.all(
    orderIds.map((id) => redis.get(`order:${id}`))
  );

  const orders = orderData
    .filter(Boolean)
    .map((o) => (typeof o === "string" ? JSON.parse(o) : o))
    .filter((o) => o.status !== "done") // kitchen only needs active + making
    .sort((a, b) => b.createdAt - a.createdAt); // newest first

  return res.status(200).json({ orders });
}
