// src/app/features/payments/cash-payment.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PaymentService } from './payment.service';

@Component({
  selector: 'app-cash-payment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule
  ],
  template: `
    <h2 mat-dialog-title>Record Cash Payment</h2>
    <div mat-dialog-content>
      <p>You are recording a cash payment for order #{{data.orderId.slice(-6)}}</p>
      <p *ngIf="data.amount">Amount: {{data.amount | currency:'INR'}}</p>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="recordPayment()" [disabled]="isProcessing">
        {{isProcessing ? 'Processing...' : 'Confirm Payment'}}
      </button>
    </div>
  `
})
export class CashPaymentComponent {
  private paymentService = inject(PaymentService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<CashPaymentComponent>);
  protected data: {orderId: string, amount: number} = inject(MAT_DIALOG_DATA);

  isProcessing = false;

  recordPayment(): void {
    this.isProcessing = true;
    this.paymentService.recordCashPayment(this.data.orderId).subscribe({
      next: (response) => {
        this.snackBar.open('Cash payment recorded successfully', 'Close', { duration: 3000 });
        this.dialogRef.close(response.data.payment);
      },
      error: (error) => {
        this.snackBar.open(error.error?.message || 'Failed to record payment', 'Close', { duration: 5000 });
        this.isProcessing = false;
      }
    });
  }
}