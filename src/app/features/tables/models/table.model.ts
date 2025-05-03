// src/app/features/tables/models/table.model.ts
export interface Table {
    _id: string;
    tableNumber: string;
    restaurantId: string | any;
    capacity: number;
    status: 'Available' | 'Reserved' | 'Occupied' | 'Cleaning' | 'Out of Service';
    currentOccupancy: number;
    qrCodeIdentifier: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface TableCreateDto {
    tableNumber: string;
    capacity: number;
  }
  
  export interface TableUpdateDto {
    tableNumber?: string;
    capacity?: number;
    status?: 'Available' | 'Reserved' | 'Occupied' | 'Cleaning' | 'Out of Service';
    currentOccupancy?: number;
  }
  
  export interface TableStatusUpdateDto {
    status: 'Available' | 'Reserved' | 'Occupied' | 'Cleaning' | 'Out of Service';
    currentOccupancy?: number;
  }