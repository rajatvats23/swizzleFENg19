// src/app/features/tables/customer-table-view.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TableService } from './table.service';
import { Table } from './models/table.model';

@Component({
  selector: 'app-customer-table-view',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  template: `
    <div class="container" *ngIf="table">
      <mat-card class="welcome-card">
        <mat-card-header>
          <div mat-card-avatar>
            <mat-icon class="header-icon">restaurant</mat-icon>
          </div>
          <mat-card-title>Welcome to {{restaurantName}}</mat-card-title>
          <mat-card-subtitle>Table {{table.tableNumber}}</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="table-status">
            <p>Table Status: 
              <mat-chip [color]="getStatusColor(table.status)" selected>{{table.status}}</mat-chip>
            </p>
            <p>Capacity: {{table.capacity}} people</p>
          </div>

          <div class="message-box" *ngIf="requiresStaffApproval">
            <mat-icon>info</mat-icon>
            <p>Please wait for a staff member to confirm your table.</p>
          </div>

          <div class="message-box success" *ngIf="!requiresStaffApproval && table.status === 'Available'">
            <mat-icon>check_circle</mat-icon>
            <p>This table is available. You can proceed to browse our menu.</p>
          </div>

          <div class="message-box warning" *ngIf="table.status === 'Occupied'">
            <mat-icon>people</mat-icon>
            <p>This table is currently occupied.</p>
          </div>

          <div class="message-box error" *ngIf="table.status === 'Out of Service'">
            <mat-icon>error</mat-icon>
            <p>This table is currently out of service. Please contact our staff for assistance.</p>
          </div>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="primary" [disabled]="table.status !== 'Available' || requiresStaffApproval">
            View Menu
          </button>
          <button mat-button color="accent">Call Server</button>
        </mat-card-actions>
      </mat-card>
    </div>

    <div class="loading-container" *ngIf="isLoading">
      <p>Loading table information...</p>
    </div>
  `,
  styles: [`
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .welcome-card {
      margin-bottom: 20px;
    }
    .header-icon {
      font-size: 40px;
      height: 40px;
      width: 40px;
    }
    .table-status {
      margin: 20px 0;
    }
    .message-box {
      display: flex;
      align-items: center;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 4px;
      margin-bottom: 16px;
    }
    .message-box mat-icon {
      margin-right: 16px;
      color: #666;
    }
    .message-box.success {
      background-color: #e8f5e9;
    }
    .message-box.success mat-icon {
      color: #4caf50;
    }
    .message-box.warning {
      background-color: #fff8e1;
    }
    .message-box.warning mat-icon {
      color: #ff9800;
    }
    .message-box.error {
      background-color: #ffebee;
    }
    .message-box.error mat-icon {
      color: #f44336;
    }
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 40px;
    }
  `]
})
export class CustomerTableViewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private tableService = inject(TableService);
  private snackBar = inject(MatSnackBar);

  table: Table | null = null;
  restaurantName = '';
  requiresStaffApproval = false;
  isLoading = true;

  ngOnInit(): void {
    const qrCodeIdentifier = this.route.snapshot.params['qrCodeId'];
    if (qrCodeIdentifier) {
      this.loadTableByQRCode(qrCodeIdentifier);
    } else {
      this.snackBar.open('Invalid table QR code', 'Close', { duration: 5000 });
    }
  }

  loadTableByQRCode(qrCodeId: string): void {
    this.isLoading = true;
    this.tableService.getTableByQRCode(qrCodeId).subscribe({
      next: (response) => {
        this.table = response.data.table;
        this.requiresStaffApproval = response.data.requiresStaffApproval;
        
        // Get restaurant name from the populated restaurant data
        if (this.table.restaurantId && typeof this.table.restaurantId === 'object') {
          this.restaurantName = this.table.restaurantId.name || 'Our Restaurant';
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        this.snackBar.open(error.error?.message || 'Failed to load table information', 'Close', { duration: 5000 });
        this.isLoading = false;
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Available': return 'primary';
      case 'Reserved': return 'accent';
      case 'Occupied': return 'warn';
      case 'Cleaning': return '';
      case 'Out of Service': return '';
      default: return '';
    }
  }
}