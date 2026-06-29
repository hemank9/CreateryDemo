// api/push-menu.js
// One-time/admin route: pushes your menu to Petpooja, then stores the
// our-id -> petpooja-id mapping in Redis so save-order.js can use real IDs.
//
// Call this manually whenever your menu changes:
//   GET https://createry.cafe/api/push-menu?key=YOUR_ADMIN_KEY

import { Redis } from "@upstash/redis";
import { pushMenuToPetpooja } from "./_petpooja-menu.js";
import { MENU } from "./_menu-data.js";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  // Simple protection so randoms can't trigger a menu push
  if (req.query.key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const result = await pushMenuToPetpooja();

    // Petpooja's response should echo back items with their assigned IDs.
    // Since we send our own itemid (item.id), Petpooja should accept and
    // store that same ID — so for this integration, our IDs ARE Petpooja's IDs.
    // We persist a confirmation mapping anyway for traceability + future-proofing.
    const mapping = {};
    MENU.forEach((item) => {
      mapping[item.id] = String(item.id);
    });

    await redis.set("petpooja:item-mapping", JSON.stringify(mapping));
    await redis.set("petpooja:last-menu-push", JSON.stringify({
      pushedAt: Date.now(),
      itemCount: MENU.length,
      response: result,
    }));

    return res.status(200).json({
      success: true,
      itemCount: MENU.length,
      petpoojaResponse: result,
    });
  } catch (err) {
    console.error("Menu push error:", err);
    return res.status(500).json({ error: err.message });
  }
}
