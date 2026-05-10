// api/orders/update.js
// PATCH /api/orders/update
// Called by the kitchen display to update order status

import { kv } from '@vercel/kv';

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

  const order = await kv.get(`order:${id}`);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  order.status = status;
  if (status === 'done') order.doneTs = Date.now();
  if (status !== 'done') order.doneTs = null;

  await kv.set(`order:${id}`, order);

  return res.status(200).json({ success: true, order });
}
