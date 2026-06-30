import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Debug-only route to inspect what Petpooja actually sent us.
// Visit: https://createry.cafe/api/debug-menu?key=YOUR_ADMIN_KEY
export default async function handler(req, res) {
  if (req.query.key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const raw = await redis.get("petpooja:received-menu");
  const receivedAt = await redis.get("petpooja:menu-received-at");
  const mapping = await redis.get("petpooja:item-mapping");

  if (!raw) {
    return res.status(200).json({
      received: false,
      message: "No menu has been received yet. Trigger 'Menu Trigger' from the Petpooja dashboard.",
    });
  }

  const menuData = typeof raw === "string" ? JSON.parse(raw) : raw;
  const mappingData = mapping ? (typeof mapping === "string" ? JSON.parse(mapping) : mapping) : {};

  return res.status(200).json({
    received: true,
    receivedAt: receivedAt ? new Date(Number(receivedAt)).toISOString() : null,
    itemMappingCount: Object.keys(mappingData).length,
    itemMapping: mappingData,
    rawMenuData: menuData,
  });
}
