// src/app/features/reservations/reservation-detail.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { ReservationService } from './reservation.service';
import { TableService } from '../tables/table.service';
import { Reservation, StatusUpdateDto } from './models/reservation.model';
import { Table } from '../tables/models/table.model';
import { AuthService } from '../auth/auth.service';
import { ConfirmDialogComponent } from '../../shared/generics/cofirm-dialog.component';

@Component({
  selector: 'app-reservation-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule
  ],
  template: `
    <div class="container" *ngIf="reservation">
      <div class="header-actions">
        <span class="top-label">Reservation Details</span>
        <div class="action-buttons">
          <button mat-button color="primary" routerLink="/reservations">
            <mat-icon class="material-symbols-outlined">arrow_back</mat-icon> Back to List
          </button>
          <button mat-raised-button color="accent" [routerLink]="['/reservations/edit', reservation._id]" *ngIf="canManageReservations()">
            <mat-icon class="material-symbols-outlined">edit</mat-icon> Edit
          </button>
        </div>
      </div>
      
      <div class="detail-grid">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Customer Information</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="info-container">
              <div class="info-row">
                <span class="label">Name:</span>
                <span>{{reservation.customer.name}}</span>
              </div>
              <div class="info-row">
                <span class="label">Phone:</span>
                <span>{{reservation.customer.phoneNumber}}</span>
              </div>
              <div class="info-row" *ngIf="reservation.customer.email">
                <span class="label">Email:</span>
                <span>{{reservation.customer.email}}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-card-title>Reservation Details</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="info-container">
              <div class="info-row">
                <span class="label">Date & Time:</span>
                <span>{{formatDateTime(reservation.reservationDate)}}</span>
              </div>
              <div class="info-row">
                <span class="label">Party Size:</span>
                <span>{{reservation.partySize}} people</span>
              </div>
              <div class="info-row">
                <span class="label">Status:</span>
                <mat-chip [color]="getStatusColor(reservation.status)" selected>{{reservation.status | titlecase}}</mat-chip>
              </div>
              <div class="info-row">
                <span class="label">Table:</span>
                <span>{{getTableInfo()}}</span>
              </div>
              <div class="info-row" *ngIf="reservation.specialRequests">
                <span class="label">Special Requests:</span>
                <span>{{reservation.specialRequests}}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card *ngIf="canManageReservations()">
          <mat-card-header>
            <mat-card-title>Manage Reservation</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="management-section">
              <div class="status-update">
                <h3>Update Status</h3>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Status</mat-label>
                  <mat-select [(ngModel)]="selectedStatus" [disabled]="isUpdating">
                    <mat-option value="pending">Pending</mat-option>
                    <mat-option value="confirmed">Confirmed</mat-option>
                    <mat-option value="seated">Seated</mat-option>
                    <mat-option value="completed">Completed</mat-option>
                    <mat-option value="cancelled">Cancelled</mat-option>
                    <mat-option value="no-show">No-show</mat-option>
                  </mat-select>
                </mat-form-field>
                <button mat-raised-button color="primary" [disabled]="selectedStatus === reservation.status || isUpdating" (click)="updateStatus()">
                  Update Status
                </button>
              </div>

              <mat-divider class="section-divider"></mat-divider>

              <div class="table-assignment">
                <h3>Assign Table</h3>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Select Table</mat-label>
                  <mat-select [(ngModel)]="selectedTableId" [disabled]="isUpdating || !availableTables.length">
                    <mat-option *ngFor="let table of availableTables" [value]="table._id">
                      Table {{table.tableNumber}} (Capacity: {{table.capacity}})
                    </mat-option>
                  </mat-select>
                </mat-form-field>
                <button mat-button color="primary" (click)="loadAvailableTables()" [disabled]="isLoading">
                  <mat-icon class="material-symbols-outlined">refresh</mat-icon> Refresh Tables
                </button>
                <button mat-raised-button color="primary" [disabled]="!selectedTableId || isUpdating" (click)="assignTable()">
                  Assign Table
                </button>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>

    <div class="loading-container" *ngIf="isLoading">
      <p>Loading reservation details...</p>
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
    .action-buttons {
      display: flex;
      gap: 10px;
    }
    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 20px;
    }
    .info-container {
      padding: 16px 0;
    }
    .info-row {
      margin-bottom: 16px;
      display: flex;
      align-items: center;
    }
    .label {
      font-weight: 500;
      width: 150px;
    }
    .management-section {
      padding: 16px 0;
    }
    .status-update, .table-assignment {
      margin-bottom: 24px;
    }
    .section-divider {
      margin: 24px 0;
    }
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 40px;
    }
    @media (max-width: 767px) {
      .header-actions {
        flex-direction: column;
        align-items: flex-start;
      }
      .action-buttons {
        margin-top: 10px;
        flex-wrap: wrap;
      }
    }
  `]
})
export class ReservationDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private reservationService = inject(ReservationService);
  private tableService = inject(TableService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  reservation: Reservation | null = null;
  isLoading = true;
  isUpdating = false;
  reservationId = '';
  selectedStatus = '';
  selectedTableId = '';
  availableTables: Table[] = [];

  ngOnInit(): void {
    this.reservationId = this.route.snapshot.params['id'];
    if (this.reservationId) {
      this.loadReservation();
    } else {
      this.router.navigate(['/reservations']);
    }
  }

  loadReservation(): void {
    this.isLoading = true;
    this.reservationService.getReservationById(this.reservationId).subscribe({
      next: (response) => {
        this.reservation = response.data.reservation;
        this.selectedStatus = this.reservation.status;
        if (this.reservation.table && typeof this.reservation.table === 'object') {
          this.selectedTableId = this.reservation.table._id;
        }
        this.isLoading = false;
        this.loadAvailableTables();
      },
      error: (error) => {
        this.snackBar.open(error.error?.message || 'Failed to load reservation', 'Close', { duration: 5000 });
        this.isLoading = false;
        this.router.navigate(['/reservations']);
      }
    });
  }

  loadAvailableTables(): void {
    if (!this.reservation) return;
    
    const dateString = new Date(this.reservation.reservationDate).toISOString().split('T')[0];
    
    this.reservationService.getAvailableTables(dateString, this.reservation.partySize).subscribe({
      next: (response) => {
        this.availableTables = response.data.availableTables;
        
        // Add current table to the list if it's not included
        if (this.reservation?.table && typeof this.reservation.table === 'object') {
          const currentTableId = this.reservation.table._id;
          if (!this.availableTables.some(table => table._id === currentTableId)) {
            this.availableTables.push(this.reservation.table);
          }
        }
      },
      error: (error) => {
        this.snackBar.open(error.error?.message || 'Failed to load available tables', 'Close', { duration: 5000 });
      }
    });
  }

  updateStatus(): void {
    if (!this.reservation || this.selectedStatus === this.reservation.status) return;
    
    this.isUpdating = true;
    const data: StatusUpdateDto = { status: this.selectedStatus as any };
    
    this.reservationService.updateStatus(this.reservationId, data).subscribe({
      next: (response) => {
        this.reservation = response.data.reservation;
        this.snackBar.open('Reservation status updated successfully', 'Close', { duration: 3000 });
        this.isUpdating = false;
      },
      error: (error) => {
        this.snackBar.open(error.error?.message || 'Failed to update status', 'Close', { duration: 5000 });
        this.isUpdating = false;
      }
    });
  }

  assignTable(): void {
    if (!this.reservation || !this.selectedTableId) return;
    
    this.isUpdating = true;
    
    this.reservationService.assignTable(this.reservationId, { tableId: this.selectedTableId }).subscribe({
      next: (response) => {
        this.reservation = response.data.reservation;
        this.snackBar.open('Table assigned successfully', 'Close', { duration: 3000 });
        this.isUpdating = false;
      },
      error: (error) => {
        this.snackBar.open(error.error?.message || 'Failed to assign table', 'Close', { duration: 5000 });
        this.isUpdating = false;
      }
    });
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  getTableInfo(): string {
    if (!this.reservation?.table) return 'Not assigned';
    if (typeof this.reservation.table === 'string') return 'Assigned';
    return `Table ${this.reservation.table.tableNumber} (Capacity: ${this.reservation.table.capacity})`;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'confirmed': return 'primary';
      case 'seated': return 'accent';
      case 'completed': return '';
      case 'pending': return 'warn';
      case 'cancelled': return '';
      case 'no-show': return '';
      default: return '';
    }
  }

  canManageReservations(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.role === 'manager' || user?.role === 'staff';
  }
}