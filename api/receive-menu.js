import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Petpooja calls THIS endpoint (configured as "Menu Sharing Endpoint" in their
// dashboard) and POSTs their menu data to us, including the item IDs they've
// assigned. We store it so save-order.js can map our item names to their IDs.
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const menuData = req.body;

    console.log("Received menu push from Petpooja:", JSON.stringify(menuData).slice(0, 500));

    // Store the raw menu payload
    await redis.set("petpooja:received-menu", JSON.stringify(menuData));
    await redis.set("petpooja:menu-received-at", Date.now().toString());

    // Build a name -> petpooja item id mapping for use in save-order.js
    const mapping = {};
    const items = menuData.items || menuData.item || [];

    if (Array.isArray(items)) {
      items.forEach((item) => {
        const name = item.itemname || item.item_name || item.name;
        const id = item.itemid || item.item_id || item.id;
        if (name && id) {
          mapping[name.toLowerCase()] = String(id);
        }
      });
    }

    await redis.set("petpooja:item-mapping", JSON.stringify(mapping));

    console.log(`Stored ${Object.keys(mapping).length} item mappings from Petpooja`);

    // Petpooja expects a success acknowledgment
    return res.status(200).json({
      success: true,
      message: "Menu received",
      itemsMapped: Object.keys(mapping).length,
    });
  } catch (err) {
    console.error("Error receiving menu push:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
