// src/app/features/restaurants/restaurant.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';
import { Restaurant, RestaurantCreateDto, RestaurantUpdateDto } from './models/restaurant.model';

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.API_URL}/restaurants`;

  getRestaurants(): Observable<ApiResponse<{ restaurants: Restaurant[] }>> {
    return this.http.get<ApiResponse<{ restaurants: Restaurant[] }>>(this.baseUrl);
  }

  getRestaurantById(id: string): Observable<ApiResponse<{ restaurant: Restaurant }>> {
    return this.http.get<ApiResponse<{ restaurant: Restaurant }>>(`${this.baseUrl}/${id}`);
  }

  createRestaurant(data: RestaurantCreateDto): Observable<ApiResponse<{ restaurant: Restaurant }>> {
    return this.http.post<ApiResponse<{ restaurant: Restaurant }>>(this.baseUrl, data);
  }

  updateRestaurant(id: string, data: RestaurantUpdateDto): Observable<ApiResponse<{ restaurant: Restaurant }>> {
    return this.http.put<ApiResponse<{ restaurant: Restaurant }>>(`${this.baseUrl}/${id}`, data);
  }

  deleteRestaurant(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }

  getManagerRestaurant(): Observable<ApiResponse<{ restaurant: Restaurant }>> {
    return this.http.get<ApiResponse<{ restaurant: Restaurant }>>(`${this.baseUrl}/manager/restaurant`);
  }
}