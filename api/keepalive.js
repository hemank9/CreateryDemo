import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Vercel Cron hits this on a schedule (see vercel.json) to keep the free
// Upstash Redis database from being auto-deleted after 14 days of inactivity.
export default async function handler(req, res) {
  try {
    await redis.set("keepalive:last-ping", Date.now().toString());
    const val = await redis.get("keepalive:last-ping");

    console.log("Keepalive ping successful:", val);

    return res.status(200).json({ success: true, pingedAt: Number(val) });
  } catch (err) {
    console.error("Keepalive ping failed:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
