// src/app/features/payments/models/payment.model.ts
export interface Payment {
    id: string;
    order: string | any; // orderId or populated order object
    amount: number;
    currency: string;
    status: 'pending' | 'processing' | 'successful' | 'failed';
    paymentIntentId?: string;
    paymentMethod: 'card' | 'upi' | 'cash' | 'wallet';
    receiptUrl?: string;
    metadata?: any;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface PaymentReport {
    summary: {
      totalAmount: number;
      paymentCount: number;
      methodBreakdown: {
        cash: number;
        card: number;
        upi: number;
        wallet: number;
      }
    };
    dailyTotals: {
      date: string;
      amount: number;
      count: number;
    }[];
  }
  
  export interface ApiResponse<T> {
    status: string;
    message: string;
    data: T;
  }