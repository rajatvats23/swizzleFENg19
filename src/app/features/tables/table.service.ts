// src/app/features/tables/table.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';
import { Table, TableCreateDto, TableUpdateDto, TableStatusUpdateDto } from './models/table.model';

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export interface TableQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
  status?: string;
  search?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TableService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.API_URL}/tables`;

  /**
   * Get all tables with optional pagination, sorting and filtering
   */
  getTables(params?: TableQueryParams): Observable<ApiResponse<{ tables: Table[]; total?: number }>> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.page !== undefined) {
        httpParams = httpParams.set('page', params.page.toString());
      }
      
      if (params.limit !== undefined) {
        httpParams = httpParams.set('limit', params.limit.toString());
      }
      
      if (params.sort) {
        httpParams = httpParams.set('sort', params.sort);
      }
      
      if (params.direction) {
        httpParams = httpParams.set('direction', params.direction);
      }
      
      if (params.status) {
        httpParams = httpParams.set('status', params.status);
      }
      
      if (params.search) {
        httpParams = httpParams.set('search', params.search);
      }
    }
    
    return this.http.get<ApiResponse<{ tables: Table[]; total?: number }>>(
      this.baseUrl,
      { params: httpParams }
    );
  }

  /**
   * Get table by ID
   */
  getTableById(id: string): Observable<ApiResponse<{ table: Table }>> {
    return this.http.get<ApiResponse<{ table: Table }>>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create a new table
   */
  createTable(data: TableCreateDto): Observable<ApiResponse<{ table: Table }>> {
    return this.http.post<ApiResponse<{ table: Table }>>(this.baseUrl, data);
  }

  /**
   * Update an existing table
   */
  updateTable(id: string, data: TableUpdateDto): Observable<ApiResponse<{ table: Table }>> {
    return this.http.put<ApiResponse<{ table: Table }>>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * Update table status
   */
  updateTableStatus(id: string, data: TableStatusUpdateDto): Observable<ApiResponse<{ table: Table }>> {
    return this.http.put<ApiResponse<{ table: Table }>>(`${this.baseUrl}/${id}/status`, data);
  }

  /**
   * Delete a table
   */
  deleteTable(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }

  /**
   * Get table by QR code identifier
   */
  getTableByQRCode(qrCodeIdentifier: string): Observable<ApiResponse<{ table: Table; requiresStaffApproval: boolean }>> {
    return this.http.get<ApiResponse<{ table: Table; requiresStaffApproval: boolean }>>(
      `${this.baseUrl}/qr/${qrCodeIdentifier}`
    );
  }
  
  /**
   * Generate table QR code URL 
   */
  getTableQrCodeUrl(qrCodeIdentifier: string): string {
    return `${environment.API_URL}/tables/qr/${qrCodeIdentifier}`;
  }
}