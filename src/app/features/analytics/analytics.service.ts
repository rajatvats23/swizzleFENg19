// src/app/features/analytics/analytics.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';
import {
  ApiResponse,
  DashboardSummary,
  TopSellingItem,
  DailyRevenue,
  AverageOrderValue,
  TableOccupancy,
  PeakHoursAnalysis,
  OrderFulfillmentTime,
  CustomerReturnRate,
  CategoryAnalysis,
  PaymentMethodDistribution
} from './models/analytics.model';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.API_URL}/analytics`;

  getDashboardSummary(): Observable<ApiResponse<{ summary: DashboardSummary }>> {
    return this.http.get<ApiResponse<{ summary: DashboardSummary }>>(`${this.baseUrl}/dashboard-summary`);
  }

  getTopSellingItems(startDate?: string, endDate?: string, limit: number = 10): Observable<ApiResponse<{ topItems: TopSellingItem[] }>> {
    let params = new HttpParams();
    
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    params = params.set('limit', limit.toString());
    
    return this.http.get<ApiResponse<{ topItems: TopSellingItem[] }>>(`${this.baseUrl}/top-selling-items`, { params });
  }

  getDailyRevenue(startDate?: string, endDate?: string): Observable<ApiResponse<{ dailyRevenue: DailyRevenue[] }>> {
    let params = new HttpParams();
    
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    
    return this.http.get<ApiResponse<{ dailyRevenue: DailyRevenue[] }>>(`${this.baseUrl}/daily-revenue`, { params });
  }

  getAverageOrderValue(startDate?: string, endDate?: string, groupBy: 'day' | 'week' | 'month' = 'day'): Observable<ApiResponse<{ averageOrderValues: AverageOrderValue[] }>> {
    let params = new HttpParams();
    
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    params = params.set('groupBy', groupBy);
    
    return this.http.get<ApiResponse<{ averageOrderValues: AverageOrderValue[] }>>(`${this.baseUrl}/average-order-value`, { params });
  }

  getTableOccupancy(date?: string): Observable<ApiResponse<{ occupancy: TableOccupancy }>> {
    let params = new HttpParams();
    
    if (date) params = params.set('date', date);
    
    return this.http.get<ApiResponse<{ occupancy: TableOccupancy }>>(`${this.baseUrl}/table-occupancy`, { params });
  }

  getPeakHours(startDate?: string, endDate?: string, dayOfWeek?: number): Observable<ApiResponse<PeakHoursAnalysis>> {
    let params = new HttpParams();
    
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    if (dayOfWeek !== undefined) params = params.set('dayOfWeek', dayOfWeek.toString());
    
    return this.http.get<ApiResponse<PeakHoursAnalysis>>(`${this.baseUrl}/peak-hours`, { params });
  }

  getOrderFulfillmentTime(startDate?: string, endDate?: string): Observable<ApiResponse<{ fulfillmentTime: OrderFulfillmentTime }>> {
    let params = new HttpParams();
    
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    
    return this.http.get<ApiResponse<{ fulfillmentTime: OrderFulfillmentTime }>>(`${this.baseUrl}/order-fulfillment-time`, { params });
  }

  getCustomerReturnRate(startDate?: string, endDate?: string): Observable<ApiResponse<{ customerMetrics: CustomerReturnRate }>> {
    let params = new HttpParams();
    
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    
    return this.http.get<ApiResponse<{ customerMetrics: CustomerReturnRate }>>(`${this.baseUrl}/customer-return-rate`, { params });
  }

  getCategoryPerformance(startDate?: string, endDate?: string): Observable<ApiResponse<CategoryAnalysis>> {
    let params = new HttpParams();
    
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    
    return this.http.get<ApiResponse<CategoryAnalysis>>(`${this.baseUrl}/category-performance`, { params });
  }

  getPaymentMethodDistribution(startDate?: string, endDate?: string): Observable<ApiResponse<PaymentMethodDistribution>> {
    let params = new HttpParams();
    
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    
    return this.http.get<ApiResponse<PaymentMethodDistribution>>(`${this.baseUrl}/payment-method-distribution`, { params });
  }

  /**
   * Utility method to format a date for API requests
   * @param date The date to format
   * @returns The formatted date string in YYYY-MM-DD format
   */
  formatDateForApi(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}