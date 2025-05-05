// src/app/features/payments/payment-reports.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PaymentService } from './payment.service';
import { PaymentReport } from './models/payment.model';
import { format } from 'date-fns';

@Component({
  selector: 'app-payment-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule
  ],
  template: `
    <div class="container">
      <div class="header-actions">
        <span class="header-title">Payment Reports</span>
      </div>

      <mat-card class="filter-card">
        <mat-card-content>
          <div class="filter-row">
            <mat-form-field appearance="outline">
              <mat-label>Start Date</mat-label>
              <input matInput [matDatepicker]="startPicker" [(ngModel)]="startDate">
              <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
              <mat-datepicker #startPicker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>End Date</mat-label>
              <input matInput [matDatepicker]="endPicker" [(ngModel)]="endDate">
              <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
              <mat-datepicker #endPicker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Payment Method</mat-label>
              <mat-select [(ngModel)]="paymentMethod">
                <mat-option [value]="">All Methods</mat-option>
                <mat-option value="cash">Cash</mat-option>
                <mat-option value="card">Card</mat-option>
                <mat-option value="upi">UPI</mat-option>
                <mat-option value="wallet">Wallet</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-raised-button color="primary" (click)="generateReport()">
              Generate Report
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <div class="report-container" *ngIf="report">
        <mat-card class="summary-card">
          <mat-card-header>
            <mat-card-title>Payment Summary</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="summary-grid">
              <div class="summary-item">
                <div class="summary-label">Total Amount</div>
                <div class="summary-value">{{report.summary.totalAmount | currency:'INR'}}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Payment Count</div>
                <div class="summary-value">{{report.summary.paymentCount}}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Cash Payments</div>
                <div class="summary-value">{{report.summary.methodBreakdown.cash | currency:'INR'}}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Card Payments</div>
                <div class="summary-value">{{report.summary.methodBreakdown.card | currency:'INR'}}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">UPI Payments</div>
                <div class="summary-value">{{report.summary.methodBreakdown.upi | currency:'INR'}}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Wallet Payments</div>
                <div class="summary-value">{{report.summary.methodBreakdown.wallet | currency:'INR'}}</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-card-title>Daily Totals</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <table mat-table [dataSource]="report.dailyTotals" class="daily-table">
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Date</th>
                <td mat-cell *matCellDef="let item">{{item.date | date:'mediumDate'}}</td>
              </ng-container>

              <ng-container matColumnDef="amount">
                <th mat-header-cell *matHeaderCellDef>Amount</th>
                <td mat-cell *matCellDef="let item">{{item.amount | currency:'INR'}}</td>
              </ng-container>

              <ng-container matColumnDef="count">
                <th mat-header-cell *matHeaderCellDef>Payment Count</th>
                <td mat-cell *matCellDef="let item">{{item.count}}</td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="['date', 'amount', 'count']"></tr>
              <tr mat-row *matRowDef="let row; columns: ['date', 'amount', 'count'];"></tr>
            </table>
          </mat-card-content>
        </mat-card>
      </div>
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
    .filter-card {
      margin-bottom: 20px;
    }
    .filter-row {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }
    .summary-card {
      margin-bottom: 20px;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
    }
    .summary-item {
      background-color: #f5f5f5;
      padding: 16px;
      border-radius: 4px;
    }
    .summary-label {
      font-size: 14px;
      color: #666;
      margin-bottom: 8px;
    }
    .summary-value {
      font-size: 24px;
      font-weight: 500;
    }
    .daily-table {
      width: 100%;
    }
    @media (max-width: 768px) {
      .filter-row {
        flex-direction: column;
        align-items: stretch;
      }
    }
  `]
})
export class PaymentReportsComponent implements OnInit {
  private paymentService = inject(PaymentService);
  private snackBar = inject(MatSnackBar);

  startDate = new Date();
  endDate = new Date();
  paymentMethod = '';
  isLoading = false;
  report: PaymentReport | null = null;

  ngOnInit(): void {
    // Set default date range to last 30 days
    this.startDate = new Date();
    this.startDate.setDate(this.startDate.getDate() - 30);
    this.endDate = new Date();
  }

  generateReport(): void {
    this.isLoading = true;
    const startDateStr = format(this.startDate, 'yyyy-MM-dd');
    const endDateStr = format(this.endDate, 'yyyy-MM-dd');
    
    this.paymentService.getPaymentReports(startDateStr, endDateStr, this.paymentMethod).subscribe({
      next: (response) => {
        this.report = response.data;
        this.isLoading = false;
      },
      error: (error) => {
        this.snackBar.open(error.error?.message || 'Failed to generate report', 'Close', { duration: 5000 });
        this.isLoading = false;
      }
    });
  }
}