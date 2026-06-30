import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Petpooja calls this when staff toggles "Store On/Off" on their dashboard.
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    console.log("update-store-status received:", JSON.stringify(req.body));

    // Petpooja's payload shape can vary; check common field names defensively.
    const body = req.body || {};
    const rawStatus =
      body.status ?? body.store_status ?? body.storestatus ?? body.active;

    // Normalize to boolean: accepts 1/0, "1"/"0", true/false, "active"/"inactive"
    let isOpen = true;
    if (rawStatus !== undefined) {
      isOpen = !(rawStatus === 0 || rawStatus === "0" || rawStatus === false || rawStatus === "inactive");
    }

    await redis.set("store:status", isOpen ? "1" : "0");

    return res.status(200).json({
      success: true,
      message: `Store marked as ${isOpen ? "open" : "closed"}`,
      http_code: 200,
      error: "",
    });
  } catch (err) {
    console.error("update-store-status error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
