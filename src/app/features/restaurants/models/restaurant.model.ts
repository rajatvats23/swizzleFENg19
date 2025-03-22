// src/app/features/restaurants/models/restaurant.model.ts
import { User } from '../../users/users.component';

export interface Restaurant {
  _id: string;
  name: string;
  email: string;
  phone: string;
  managerEmail: string;
  manager?: User;
  address: string;
  city: string;
  state?: string;
  zipCode?: string;
  country: string;
  detailedLocation?: {
    fullAddress?: string;
    street?: string;
    landmark?: string;
    formattedAddress?: string;
    location?: {
      type: string;
      coordinates: number[];
    };
    placeId?: string;
  };
  description?: string;
  cuisineType?: string;
  operatingHours?: {
    monday?: { open: string; close: string };
    tuesday?: { open: string; close: string };
    wednesday?: { open: string; close: string };
    thursday?: { open: string; close: string };
    friday?: { open: string; close: string };
    saturday?: { open: string; close: string };
    sunday?: { open: string; close: string };
  };
  website?: string;
  status: 'draft' | 'active' | 'inactive';
  createdBy?: User;
  completionPercentage: number;
  isBasicSetupComplete: boolean;
}

export interface RestaurantCreateDto {
  name: string;
  email: string;
  phone: string;
  managerEmail: string;
  address: string;
  city: string;
  state?: string;
  zipCode?: string;
  country: string;
  status?: 'draft' | 'active' | 'inactive';
}

export interface RestaurantUpdateDto {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  description?: string;
  cuisineType?: string;
  operatingHours?: {
    monday?: { open: string; close: string };
    tuesday?: { open: string; close: string };
    wednesday?: { open: string; close: string };
    thursday?: { open: string; close: string };
    friday?: { open: string; close: string };
    saturday?: { open: string; close: string };
    sunday?: { open: string; close: string };
  };
  website?: string;
  status?: 'draft' | 'active' | 'inactive';
  detailedLocation?: {
    fullAddress?: string;
    street?: string;
    landmark?: string;
    formattedAddress?: string;
    location?: {
      type: string;
      coordinates: number[];
    };
    placeId?: string;
  };
}