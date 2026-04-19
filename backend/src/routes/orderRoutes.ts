import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Order, OrderItem, OrderStatus, PRICE_LIST } from '../models/order';
import {
  addOrder,
  findOrderById,
  getAllOrders,
  updateOrder,
} from '../store/orderStore';

const router = express.Router();

const isValidStatus = (status: string): status is OrderStatus => {
  return ['RECEIVED', 'PROCESSING', 'READY', 'DELIVERED'].includes(status);
};

// POST /api/orders
router.post('/orders', (req: Request, res: Response) => {
  const { customerName, phone, items } = req.body as {
    customerName?: string;
    phone?: string;
    items?: { garmentType: string; quantity: number; pricePerItem?: number }[];
  };

  if (!customerName || !customerName.trim()) {
    return res.status(400).json({ message: 'customerName is required' });
  }

  if (!phone || !phone.trim()) {
    return res.status(400).json({ message: 'phone is required' });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'items are required' });
  }

  const orderItems: OrderItem[] = [];

  for (const item of items) {
    const { garmentType, quantity } = item;

    if (!garmentType || !PRICE_LIST[garmentType]) {
      return res.status(400).json({
        message: `Invalid garmentType: ${garmentType}. Allowed: ${Object.keys(
          PRICE_LIST,
        ).join(', ')}`,
      });
    }

    if (typeof quantity !== 'number' || quantity <= 0) {
      return res.status(400).json({
        message: `Invalid quantity for ${garmentType}`,
      });
    }

    const pricePerItem =
      typeof item.pricePerItem === 'number'
        ? item.pricePerItem
        : PRICE_LIST[garmentType];

    const lineTotal = quantity * pricePerItem;

    orderItems.push({
      garmentType,
      quantity,
      pricePerItem,
      lineTotal,
    });
  }

  const totalAmount = orderItems.reduce(
    (sum, item) => sum + item.lineTotal,
    0,
  );

  const now = new Date();
  const newOrder: Order = {
    id: uuidv4(),
    customerName: customerName.trim(),
    phone: phone.trim(),
    items: orderItems,
    totalAmount,
    status: 'RECEIVED',
    createdAt: now,
    updatedAt: now,
  };

  addOrder(newOrder);

  return res.status(201).json(newOrder);
});

// PATCH /api/orders/:id/status
router.patch('/orders/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body as { status?: string };

  if (!status || !isValidStatus(status)) {
    return res.status(400).json({
      message:
        "Invalid status. Allowed: 'RECEIVED', 'PROCESSING', 'READY', 'DELIVERED'",
    });
  }

  const existing = findOrderById(id);
  if (!existing) {
    return res.status(404).json({ message: 'Order not found' });
  }

  const updated: Order = {
    ...existing,
    status,
    updatedAt: new Date(),
  };

  updateOrder(updated);

  return res.json(updated);
});

// GET /api/orders
router.get('/orders', (req: Request, res: Response) => {
  const { status, customerName, phone } = req.query as {
    status?: string;
    customerName?: string;
    phone?: string;
  };

  let results = getAllOrders();

  if (status && isValidStatus(status)) {
    results = results.filter((o) => o.status === status);
  }

  if (customerName) {
    const term = customerName.toLowerCase();
    results = results.filter((o) =>
      o.customerName.toLowerCase().includes(term),
    );
  }

  if (phone) {
    const term = phone.toLowerCase();
    results = results.filter((o) => o.phone.toLowerCase().includes(term));
  }

  return res.json(results);
});

// GET /api/dashboard
router.get('/dashboard', (_req: Request, res: Response) => {
  const orders = getAllOrders();
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce(
    (sum, order) => sum + order.totalAmount,
    0,
  );

  const ordersPerStatus: Record<OrderStatus, number> = {
    RECEIVED: 0,
    PROCESSING: 0,
    READY: 0,
    DELIVERED: 0,
  };

  for (const o of orders) {
    ordersPerStatus[o.status] += 1;
  }

  return res.json({
    totalOrders,
    totalRevenue,
    ordersPerStatus,
  });
});

export default router;