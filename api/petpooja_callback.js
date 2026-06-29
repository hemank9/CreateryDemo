import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Petpooja calls this URL when an order is accepted, marked ready, or rejected on their end.
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  console.log("Petpooja callback received:", JSON.stringify(req.body));

  const { orderID, status } = req.body || {};

  if (!orderID) {
    return res.status(400).json({ error: "Missing orderID" });
  }

  // orderID here is OUR orderId (e.g. CR8-123456) since that's what we sent Petpooja
  const raw = await redis.get(`order:${orderID}`);
  if (!raw) {
    // Order may have already expired/been removed — acknowledge anyway
    return res.status(200).json({ success: true, note: "order not found locally" });
  }

  const order = typeof raw === "string" ? JSON.parse(raw) : raw;

  // Map Petpooja's status to our internal status if provided
  // Petpooja typically sends statuses like: accepted, food_ready, cancelled
  const statusMap = {
    accepted: "active",
    food_ready: "making",
    ready: "making",
    cancelled: "done",
    rejected: "done",
  };

  if (status && statusMap[status.toLowerCase()]) {
    order.status = statusMap[status.toLowerCase()];
    if (order.status === "done") {
      await redis.zrem("orders:active", orderID);
    }
  }

  order.petpoojaStatus = status || order.petpoojaStatus;
  await redis.set(`order:${orderID}`, JSON.stringify(order), { ex: 86400 });

  return res.status(200).json({ success: true });
}
