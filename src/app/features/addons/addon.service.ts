import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';
import { Addon, AddonCreateDto, AddonUpdateDto } from './models/addon.model';

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class AddonService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.API_URL}/addons`;

  getAddons(): Observable<ApiResponse<{ addons: Addon[] }>> {
    return this.http.get<ApiResponse<{ addons: Addon[] }>>(this.baseUrl);
  }

  getAddonById(id: string): Observable<ApiResponse<{ addon: Addon }>> {
    return this.http.get<ApiResponse<{ addon: Addon }>>(`${this.baseUrl}/${id}`);
  }

  createAddon(data: AddonCreateDto): Observable<ApiResponse<{ addon: Addon }>> {
    return this.http.post<ApiResponse<{ addon: Addon }>>(this.baseUrl, data);
  }

  updateAddon(id: string, data: AddonUpdateDto): Observable<ApiResponse<{ addon: Addon }>> {
    return this.http.put<ApiResponse<{ addon: Addon }>>(`${this.baseUrl}/${id}`, data);
  }

  deleteAddon(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }
}