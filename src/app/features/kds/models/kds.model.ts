// src/app/features/kds/models/kds.model.ts

export interface OrderItem {
    _id: string;
    product: {
      _id: string;
      name: string;
      price?: number;
      imageUrl?: string;
    };
    quantity: number;
    price: number;
    selectedAddons?: Array<{
      addon: {
        _id: string;
        name: string;
      };
      subAddon: {
        name: string;
        price: number;
      };
    }>;
    specialInstructions?: string;
    status: 'ordered' | 'preparing' | 'ready' | 'delivered';
  }
  
  export interface Table {
    _id: string;
    tableNumber: string;
  }
  
  export interface Customer {
    _id: string;
    name: string;
    phoneNumber: string;
  }
  
  export interface Order {
    _id: string;
    customer: string | Customer;
    restaurant: string;
    name?: string;
    table: Table;
    items: OrderItem[];
    phoneNumber: string;
    status: 'placed' | 'preparing' | 'ready' | 'delivered' | 'completed';
    totalAmount: number;
    specialInstructions?: string;
    createdAt: string;
  }
  
  export interface ApiResponse<T> {
    status: string;
    message: string;
    data: T;
  }
  
  export interface OrderStatusUpdateDto {
    status: 'placed' | 'preparing' | 'ready' | 'delivered' | 'completed';
  }
  
  export interface OrderItemStatusUpdateDto {
    status: 'ordered' | 'preparing' | 'ready' | 'delivered';
  }