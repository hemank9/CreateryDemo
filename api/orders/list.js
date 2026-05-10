// api/orders/list.js
// GET /api/orders/list
// Polled by the kitchen display every 3 seconds

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // Get last 100 order IDs
  const ids = await kv.lrange('orders:list', 0, 99);
  if (!ids || !ids.length) return res.status(200).json({ orders: [] });

  // Fetch all orders in parallel
  const orders = await Promise.all(
    ids.map(id => kv.get(`order:${id}`))
  );

  // Filter out nulls (deleted/expired orders)
  const valid = orders.filter(Boolean);

  return res.status(200).json({ orders: valid });
}
