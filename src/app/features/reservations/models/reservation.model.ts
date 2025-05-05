// src/app/features/reservations/models/reservation.model.ts
export interface Reservation {
    _id: string;
    restaurant: string | any;
    customer: {
      name: string;
      phoneNumber: string;
      email?: string;
    };
    partySize: number;
    reservationDate: string;
    specialRequests?: string;
    status: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no-show';
    table?: string | any;
    assignedBy?: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface ReservationCreateDto {
    customerName: string;
    phoneNumber: string;
    email?: string;
    partySize: number;
    reservationDate: string;
    specialRequests?: string;
  }
  
  export interface ReservationUpdateDto {
    customerName?: string;
    phoneNumber?: string;
    email?: string;
    partySize?: number;
    reservationDate?: string;
    specialRequests?: string;
    status?: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no-show';
  }
  
  export interface TableAssignmentDto {
    tableId: string;
  }
  
  export interface StatusUpdateDto {
    status: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no-show';
  }