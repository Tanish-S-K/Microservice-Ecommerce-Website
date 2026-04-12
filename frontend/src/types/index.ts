export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
  rating: number;
  reviewCount: number;
  tags: string[];
}

export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
}

export interface BundleDeal {
  id: string;
  name: string;
  description: string;
  productIds: string[];
  discountPercent: number;
  active: boolean;
}

export interface BundleCheckResponse {
  bundleId: string;
  bundleName: string;
  description: string;
  matched: boolean;
  discountPercent: number;
  discountAmount: number;
  productIds: string[];
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  total: number;
  status: string;
  paymentMethod: string;
  shippingAddress: string;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
}

export interface AuthResponse {
  token: string;
  userId: string;
  name: string;
  email: string;
  role: string;
}

export interface RecommendationResponse {
  productIds: string[];
}

export interface BundleSuggestion {
  productIds: string[];
  productNames: string[];
  suggestedDiscount: number;
}
