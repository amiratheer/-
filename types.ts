export enum UserRole {
  ADMIN = 'admin',
  RESTAURANT_MANAGER = 'restaurant_manager',
  CHEF = 'chef',
  DRIVER = 'driver',
  CUSTOMER = 'customer'
}

export enum OrderStatus {
  PENDING = 'restaurant_pending',
  ACCEPTED = 'accepted_by_restaurant',
  PREPARING = 'preparing',
  READY = 'ready_for_delivery',
  ON_THE_WAY = 'on_the_way',
  DELIVERED = 'delivered',
  REJECTED = 'restaurant_rejected'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  restaurantId?: string; // Null for Admin/Customer
  avatar?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  logo: string;
  isOpen: boolean;
  deliveryFee: number;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  price: number;
  image: string;
  category: string;
  isAvailable: boolean;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  restaurantId: string;
  restaurantName: string;
  chefId?: string;
  driverId?: string;
  status: OrderStatus;
  items: OrderItem[];
  totalPrice: number;
  createdAt: Date;
  location?: { lat: number; lng: number }; // Driver location
}