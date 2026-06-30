import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Petpooja calls this when staff marks an item out-of-stock on their dashboard.
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    console.log("item-off received:", JSON.stringify(req.body));

    const body = req.body || {};
    // Petpooja may send a single item or an array — handle both.
    const itemIds = body.itemid
      ? Array.isArray(body.itemid)
        ? body.itemid
        : [body.itemid]
      : body.item_id
      ? Array.isArray(body.item_id)
        ? body.item_id
        : [body.item_id]
      : body.inStockArray || body.items || [];

    const ids = itemIds.map((i) => (typeof i === "object" ? i.itemid || i.item_id || i.id : i)).filter(Boolean);

    for (const id of ids) {
      await redis.sadd("store:out-of-stock-items", String(id));
    }

    return res.status(200).json({
      success: true,
      message: `${ids.length} item(s) marked out of stock`,
      itemIds: ids,
      http_code: 200,
      error: "",
    });
  } catch (err) {
    console.error("item-off error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
