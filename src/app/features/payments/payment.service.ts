// src/app/features/payments/payment.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';
import { Payment, PaymentReport } from './models/payment.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.API_URL}/payments`;

  // Record cash payment
  recordCashPayment(orderId: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/cash`, { orderId });
  }

  // Get payments for a specific order
  getOrderPayments(orderId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/order/${orderId}`);
  }

  // Get payment reports with filters
  getPaymentReports(startDate: string, endDate: string, paymentMethod?: string): Observable<any> {
    let params: any = { startDate, endDate };
    if (paymentMethod) {
      params.paymentMethod = paymentMethod;
    }
    return this.http.get<any>(`${this.baseUrl}/reports`, { params });
  }

  // Get a specific payment
  getPayment(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }
}