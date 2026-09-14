import { Timestamp } from "firebase/firestore";
import type { PaymentMethod } from "./cart";

export type CartItem = {
  productId: string;
  name: string;
  sku: string;
  price: number;
  qty: number;
  subtotal: number;
};

export type TransactionItem = Omit<CartItem, "stock">;
// Payment Method sudah ada di { PaymentMethod } from "./cart";

export type Transaction = {
  id: string;
  invoiceNumber: string;
  items: TransactionItem[];
  subtotal: number;
  total: number;
  paymentAmount: number;
  changeAmount: number;
  paymentmethod: PaymentMethod;
  change: number;
  createdAt: Timestamp;
}

