// src/app/features/payments/payment-list.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PaymentService } from './payment.service';
import { Payment } from './models/payment.model';

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  template: `
    <div class="container">
      <div class="header-actions">
        <span class="header-title">Order Payments</span>
      </div>

      <mat-card>
        <mat-card-content>
          <table mat-table [dataSource]="payments" class="payment-table">
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>ID</th>
              <td mat-cell *matCellDef="let payment">{{payment.id.slice(-8)}}</td>
            </ng-container>

            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Amount</th>
              <td mat-cell *matCellDef="let payment">{{payment.amount | currency:payment.currency:'symbol'}}</td>
            </ng-container>

            <ng-container matColumnDef="paymentMethod">
              <th mat-header-cell *matHeaderCellDef>Method</th>
              <td mat-cell *matCellDef="let payment">{{payment.paymentMethod | titlecase}}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let payment">
                <mat-chip [color]="getStatusColor(payment.status)" selected>
                  {{payment.status | titlecase}}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="createdAt">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let payment">{{payment.createdAt | date:'medium'}}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let payment">
                <a mat-icon-button [href]="payment.receiptUrl" target="_blank" *ngIf="payment.receiptUrl">
                  <mat-icon>receipt</mat-icon>
                </a>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            
            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell" colspan="6" style="text-align: center; padding: 16px;">
                No payments found for this order
              </td>
            </tr>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container {
      width: 100%;
    }
    .header-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .payment-table {
      width: 100%;
    }
  `]
})
export class PaymentListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private paymentService = inject(PaymentService);
  private snackBar = inject(MatSnackBar);

  payments: Payment[] = [];
  orderId: string = '';
  isLoading = true;
  displayedColumns: string[] = ['id', 'amount', 'paymentMethod', 'status', 'createdAt', 'actions'];

  ngOnInit(): void {
    this.orderId = this.route.snapshot.params['orderId'];
    if (this.orderId) {
      this.loadOrderPayments();
    }
  }

  loadOrderPayments(): void {
    this.isLoading = true;
    this.paymentService.getOrderPayments(this.orderId).subscribe({
      next: (response) => {
        this.payments = response.data.payments;
        this.isLoading = false;
      },
      error: (error) => {
        this.snackBar.open(error.error?.message || 'Failed to load payments', 'Close', { duration: 5000 });
        this.isLoading = false;
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'successful': return 'primary';
      case 'pending': return 'accent';
      case 'processing': return 'accent';
      case 'failed': return 'warn';
      default: return '';
    }
  }
}