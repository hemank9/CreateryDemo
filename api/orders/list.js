// api/orders/list.js
// GET /api/orders/list

import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const ids = await redis.lrange('orders:list', 0, 99);
  if (!ids || !ids.length) return res.status(200).json({ orders: [] });

  const orders = await Promise.all(
    ids.map(async id => {
      const raw = await redis.get(`order:${id}`);
      if (!raw) return null;
      return typeof raw === 'string' ? JSON.parse(raw) : raw;
    })
  );

  return res.status(200).json({ orders: orders.filter(Boolean) });
}
