// src/app/features/categories/category.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';

export interface Category {
  _id: string;
  name: string;
  description?: string;
  order: number;
  menus: string[] | any[];
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
export class CategoryService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.API_URL}/categories`;

  getCategories(): Observable<ApiResponse<{ categories: Category[] }>> {
    return this.http.get<ApiResponse<{ categories: Category[] }>>(this.baseUrl);
  }

  getCategoryById(id: string): Observable<ApiResponse<{ category: Category }>> {
    return this.http.get<ApiResponse<{ category: Category }>>(`${this.baseUrl}/${id}`);
  }

  createCategory(data: { name: string; description?: string; order?: number; menus?: string[] }): Observable<ApiResponse<{ category: Category }>> {
    return this.http.post<ApiResponse<{ category: Category }>>(this.baseUrl, data);
  }

  updateCategory(id: string, data: { name?: string; description?: string; order?: number; menus?: string[] }): Observable<ApiResponse<{ category: Category }>> {
    return this.http.put<ApiResponse<{ category: Category }>>(`${this.baseUrl}/${id}`, data);
  }

  deleteCategory(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }
}