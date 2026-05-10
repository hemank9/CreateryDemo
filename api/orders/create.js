// api/orders/create.js
// POST /api/orders/create
// Called by the customer app when an order is placed

import { kv } from '@vercel/kv';

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

  // Store order by ID
  await kv.set(`order:${id}`, order);

  // Add to ordered list (newest first)
  await kv.lpush('orders:list', id);

  // Keep only last 100 orders
  await kv.ltrim('orders:list', 0, 99);

  return res.status(200).json({ success: true, order });
}
