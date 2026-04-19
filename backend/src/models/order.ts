export type OrderStatus = 'RECEIVED' | 'PROCESSING' | 'READY' | 'DELIVERED';

export interface OrderItem {
  garmentType: string;   // e.g. 'SHIRT', 'PANTS', 'SAREE'
  quantity: number;
  pricePerItem: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  estimatedDeliveryDate?: Date;
}

export const PRICE_LIST: Record<string, number> = {
  SHIRT: 50,
  PANTS: 70,
  SAREE: 100,
};