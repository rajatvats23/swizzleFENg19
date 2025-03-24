import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';
import { Product, ProductCreateDto, ProductUpdateDto } from './product.model';

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.API_URL}/products`;

  getProducts(filters: {
    category?: string;
    tag?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
  } = {}): Observable<ApiResponse<{ products: Product[] }>> {
    // Build query string from filters
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    
    const queryString = queryParams.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    
    return this.http.get<ApiResponse<{ products: Product[] }>>(url);
  }

  getProductById(id: string): Observable<ApiResponse<{ product: Product }>> {
    return this.http.get<ApiResponse<{ product: Product }>>(`${this.baseUrl}/${id}`);
  }

  createProduct(data: ProductCreateDto): Observable<ApiResponse<{ product: Product }>> {
    return this.http.post<ApiResponse<{ product: Product }>>(this.baseUrl, data);
  }

  updateProduct(id: string, data: ProductUpdateDto): Observable<ApiResponse<{ product: Product }>> {
    return this.http.put<ApiResponse<{ product: Product }>>(`${this.baseUrl}/${id}`, data);
  }

  deleteProduct(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }

  getUploadUrl(fileType: string, fileName: string): Observable<ApiResponse<{ uploadUrl: string; imageUrl: string }>> {
    return this.http.post<ApiResponse<{ uploadUrl: string; imageUrl: string }>>(
      `${this.baseUrl}/upload-url`,
      { fileType, fileName }
    );
  }

  uploadToS3(url: string, file: File): Observable<any> {
    // Use HttpClient directly to send PUT request to S3
    return this.http.put(url, file, {
      headers: {
        'Content-Type': file.type
      }
    });
  }
}
