// src/app/features/tables/table.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';
import { Table, TableCreateDto, TableUpdateDto, TableStatusUpdateDto } from './models/table.model';

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class TableService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.API_URL}/tables`;

  getTables(): Observable<ApiResponse<{ tables: Table[] }>> {
    return this.http.get<ApiResponse<{ tables: Table[] }>>(this.baseUrl);
  }

  getTableById(id: string): Observable<ApiResponse<{ table: Table }>> {
    return this.http.get<ApiResponse<{ table: Table }>>(`${this.baseUrl}/${id}`);
  }

  createTable(data: TableCreateDto): Observable<ApiResponse<{ table: Table }>> {
    return this.http.post<ApiResponse<{ table: Table }>>(this.baseUrl, data);
  }

  updateTable(id: string, data: TableUpdateDto): Observable<ApiResponse<{ table: Table }>> {
    return this.http.put<ApiResponse<{ table: Table }>>(`${this.baseUrl}/${id}`, data);
  }

  updateTableStatus(id: string, data: TableStatusUpdateDto): Observable<ApiResponse<{ table: Table }>> {
    return this.http.put<ApiResponse<{ table: Table }>>(`${this.baseUrl}/${id}/status`, data);
  }

  deleteTable(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }

  getTableByQRCode(qrCodeIdentifier: string): Observable<ApiResponse<{ table: Table; requiresStaffApproval: boolean }>> {
    return this.http.get<ApiResponse<{ table: Table; requiresStaffApproval: boolean }>>(`${this.baseUrl}/qr/${qrCodeIdentifier}`);
  }
}