import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Petpooja calls this to check if your store is currently open or closed.
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const status = await redis.get("store:status");
    // default to "open" (1) if never set
    const isOpen = status === null || status === undefined ? true : status === "1" || status === 1;

    return res.status(200).json({
      success: true,
      restID: process.env.PETPOOJA_REST_ID,
      store_status: isOpen ? 1 : 0,
      message: isOpen ? "Store is open" : "Store is closed",
      http_code: 200,
      error: "",
    });
  } catch (err) {
    console.error("get-store-status error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
