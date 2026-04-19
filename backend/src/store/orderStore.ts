import { Order } from '../models/order';

const orders: Order[] = [];

export const getAllOrders = (): Order[] => orders;

export const addOrder = (order: Order): Order => {
  orders.push(order);
  return order;
};

export const findOrderById = (id: string): Order | undefined => {
  return orders.find((o) => o.id === id);
};

export const updateOrder = (updated: Order): Order | null => {
  const index = orders.findIndex((o) => o.id === updated.id);
  if (index === -1) return null;
  orders[index] = updated;
  return updated;
};