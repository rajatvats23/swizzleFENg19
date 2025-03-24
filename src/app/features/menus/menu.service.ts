// src/app/features/menus/menu.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';

export interface Menu {
  _id: string;
  name: string;
  description?: string;
  restaurantId: string | any;
  createdBy: string | any;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.API_URL}/menus`;

  getMenus(): Observable<ApiResponse<{ menus: Menu[] }>> {
    return this.http.get<ApiResponse<{ menus: Menu[] }>>(this.baseUrl);
  }

  getMenuById(id: string): Observable<ApiResponse<{ menu: Menu }>> {
    return this.http.get<ApiResponse<{ menu: Menu }>>(`${this.baseUrl}/${id}`);
  }

  createMenu(data: { name: string; description?: string }): Observable<ApiResponse<{ menu: Menu }>> {
    return this.http.post<ApiResponse<{ menu: Menu }>>(this.baseUrl, data);
  }

  updateMenu(id: string, data: { name?: string; description?: string }): Observable<ApiResponse<{ menu: Menu }>> {
    return this.http.put<ApiResponse<{ menu: Menu }>>(`${this.baseUrl}/${id}`, data);
  }

  deleteMenu(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }
}