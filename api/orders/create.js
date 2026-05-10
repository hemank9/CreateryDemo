// api/orders/create.js
// POST /api/orders/create

import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { id, customer, phone, slot, items } = req.body;
  if (!id || !customer || !items?.length) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const order = {
    id,
    customer,
    phone: phone || '',
    slot: slot || 'ASAP',
    items,
    status: 'new',
    ts: Date.now(),
    doneTs: null,
  };

  // Store order by ID (expires after 24 hours)
  await redis.set(`order:${id}`, JSON.stringify(order), { ex: 86400 });

  // Add to list (newest first), keep last 100
  await redis.lpush('orders:list', id);
  await redis.ltrim('orders:list', 0, 99);

  return res.status(200).json({ success: true, order });
}
