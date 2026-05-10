// api/orders/update.js
// PATCH /api/orders/update

import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });

  const { id, status } = req.body;
  if (!id || !['new', 'making', 'done'].includes(status)) {
    return res.status(400).json({ error: 'Invalid id or status' });
  }

  const raw = await redis.get(`order:${id}`);
  if (!raw) return res.status(404).json({ error: 'Order not found' });

  const order = typeof raw === 'string' ? JSON.parse(raw) : raw;
  order.status = status;
  order.doneTs = status === 'done' ? Date.now() : null;

  await redis.set(`order:${id}`, JSON.stringify(order), { ex: 86400 });

  return res.status(200).json({ success: true, order });
}
