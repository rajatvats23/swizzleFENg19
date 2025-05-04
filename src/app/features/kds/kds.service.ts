// src/app/features/kds/kds.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject, interval, switchMap, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environment/environment';
import { ApiResponse, Order, OrderStatusUpdateDto, OrderItemStatusUpdateDto } from './models/kds.model';

@Injectable({
  providedIn: 'root'
})
export class KitchenDisplayService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.API_URL}/staff/orders`;
  
  private activeOrdersSubject = new BehaviorSubject<Order[]>([]);
  activeOrders$ = this.activeOrdersSubject.asObservable();
  
  private pollingSubscription: any;
  private pollingInterval = 30000; // 30 seconds
  
  // Start polling for active orders
  startPolling(): void {
    // Clear any existing subscription
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
    
    // Set up polling
    this.pollingSubscription = interval(this.pollingInterval)
      .pipe(
        switchMap(() => this.fetchActiveOrders()),
        catchError(error => {
          console.error('Error polling active orders:', error);
          return of(null);
        })
      )
      .subscribe();
      
    // Initial fetch
    this.fetchActiveOrders().subscribe();
  }
  
  // Stop polling when component is destroyed
  stopPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = null;
    }
  }
  
  // Fetch active orders
  fetchActiveOrders(): Observable<ApiResponse<{ orders: Order[] }>> {
    return this.http.get<ApiResponse<{ orders: Order[] }>>(`${this.baseUrl}/active`)
      .pipe(
        tap(response => {
          if (response && response.data && response.data.orders) {
            this.activeOrdersSubject.next(response.data.orders);
          }
        })
      );
  }
  
  // Get a specific order
  getOrderById(id: string): Observable<ApiResponse<{ order: Order }>> {
    return this.http.get<ApiResponse<{ order: Order }>>(`${this.baseUrl}/${id}`);
  }
  
  // Update order status
  updateOrderStatus(id: string, data: OrderStatusUpdateDto): Observable<ApiResponse<{ order: Order }>> {
    return this.http.put<ApiResponse<{ order: Order }>>(`${this.baseUrl}/${id}/status`, data);
  }
  
  // Update order item status
  updateOrderItemStatus(orderId: string, itemId: string, data: OrderItemStatusUpdateDto): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/${orderId}/items/${itemId}/status`, data);
  }
  
  // Manually refresh orders (for user-triggered refresh)
  refreshOrders(): void {
    this.fetchActiveOrders().subscribe();
  }
  
  // Calculate time since order was placed
  getTimeSinceOrder(createdAt: string): string {
    const orderDate = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - orderDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins === 1) {
      return '1 minute ago';
    } else if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else {
      const hours = Math.floor(diffMins / 60);
      return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    }
  }
}