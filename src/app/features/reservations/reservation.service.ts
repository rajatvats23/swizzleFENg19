// src/app/features/reservations/reservation.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';
import { Reservation, ReservationCreateDto, ReservationUpdateDto, TableAssignmentDto, StatusUpdateDto } from './models/reservation.model';
import { Table } from '../tables/models/table.model';

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.API_URL}/reservations`;

  getReservations(date?: string, status?: string): Observable<ApiResponse<{ reservations: Reservation[] }>> {
    let url = this.baseUrl;
    const params: any = {};
    
    if (date) params.date = date;
    if (status) params.status = status;
    
    return this.http.get<ApiResponse<{ reservations: Reservation[] }>>(this.baseUrl, { params });
  }

  getReservationById(id: string): Observable<ApiResponse<{ reservation: Reservation }>> {
    return this.http.get<ApiResponse<{ reservation: Reservation }>>(`${this.baseUrl}/${id}`);
  }

  createReservation(data: ReservationCreateDto): Observable<ApiResponse<{ reservation: Reservation }>> {
    return this.http.post<ApiResponse<{ reservation: Reservation }>>(this.baseUrl, data);
  }

  updateReservation(id: string, data: ReservationUpdateDto): Observable<ApiResponse<{ reservation: Reservation }>> {
    return this.http.put<ApiResponse<{ reservation: Reservation }>>(`${this.baseUrl}/${id}`, data);
  }

  assignTable(id: string, data: TableAssignmentDto): Observable<ApiResponse<{ reservation: Reservation }>> {
    return this.http.put<ApiResponse<{ reservation: Reservation }>>(`${this.baseUrl}/${id}/assign-table`, data);
  }

  updateStatus(id: string, data: StatusUpdateDto): Observable<ApiResponse<{ reservation: Reservation }>> {
    return this.http.put<ApiResponse<{ reservation: Reservation }>>(`${this.baseUrl}/${id}/status`, data);
  }

  getAvailableTables(date: string, partySize: number): Observable<ApiResponse<{ availableTables: Table[] }>> {
    const params = { date, partySize: partySize.toString() };
    return this.http.get<ApiResponse<{ availableTables: Table[] }>>(`${this.baseUrl}/available-tables`, { params });
  }
}