export type CartItem = {
  productId: string;
  name: string;
  sku: string;
  price: number;
  qty: number;
  stock: number;
  subtotal: number;
};

export type PaymentMethod = "cash" | "transfer" | "qris";