export type UserRole = 'CUSTOMER' | 'STAFF' | 'ADMIN';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PACKING'
  | 'DELIVERING'
  | 'DELIVERED'
  | 'CANCEL_REQUESTED'
  | 'CANCELLED'
  | 'COMPLETED';

export type PaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED';
export type PaymentMethod = 'COD' | 'BANK_TRANSFER';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  address?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  sortOrder: number;
}

export interface ProductSku {
  id: string;
  productId: string;
  skuCode: string;
  name: string;
  weightKg: number;
  price: number;
  stock: number;
  imageUrl?: string;
  isActive: boolean;
  isDefault: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  origin: string;
  categoryId?: string;
  category?: Category;
  isFeatured: boolean;
  isActive: boolean;
  images?: string[];
  skus: ProductSku[];
}

export interface DeliveryZone {
  id: string;
  name: string;
  fee: number;
  description?: string;
  estimatedDelivery: string;
  isActive: boolean;
}

export interface CartItem {
  skuId: string;
  skuCode: string;
  skuName: string;
  productName: string;
  weightKg: number;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  lineWeight: number;
  imageUrl?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  skuId?: string;
  productName: string;
  skuName: string;
  skuCode: string;
  weightKg: number;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  lineWeight: number;
  imageUrl?: string;
}

export interface OrderHistory {
  id: string;
  orderId: string;
  previousStatus: OrderStatus | null;
  nextStatus: OrderStatus;
  note?: string;
  actionByRole: string;
  actionByUserId?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderCode: string;
  customerId?: string;
  customer?: User;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  deliveryZoneId?: string;
  deliveryZone?: DeliveryZone;
  deliveryFee: number;
  subtotal: number;
  totalAmount: number;
  totalWeightKg: number;
  totalBags: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  note?: string;
  items: OrderItem[];
  histories: OrderHistory[];
  createdAt: string;
}

export interface OrderQuote {
  lineItems: CartItem[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  totalWeightKg: number;
  totalBags: number;
  deliveryZone: DeliveryZone;
}

