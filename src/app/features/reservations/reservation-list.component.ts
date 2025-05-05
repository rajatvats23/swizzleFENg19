// src/app/features/reservations/reservation-list.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReservationService } from './reservation.service';
import { Reservation } from './models/reservation.model';
import { AuthService } from '../auth/auth.service';
import { format } from 'date-fns';

@Component({
  selector: 'app-reservation-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  template: `
    <div class="container">
      <div class="header-actions">
        <span class="header-title">Reservation Management</span>
        <button mat-raised-button color="primary" routerLink="/reservations/create" *ngIf="canManageReservations()">
          <mat-icon class="material-symbols-outlined">add</mat-icon> Add Reservation
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <div class="filter-container">
            <mat-form-field appearance="outline">
              <mat-label>Date</mat-label>
              <input matInput [matDatepicker]="picker" [(ngModel)]="selectedDate" (dateChange)="loadReservations()">
              <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select [(ngModel)]="selectedStatus" (selectionChange)="loadReservations()">
                <mat-option [value]="">All</mat-option>
                <mat-option value="pending">Pending</mat-option>
                <mat-option value="confirmed">Confirmed</mat-option>
                <mat-option value="seated">Seated</mat-option>
                <mat-option value="completed">Completed</mat-option>
                <mat-option value="cancelled">Cancelled</mat-option>
                <mat-option value="no-show">No-show</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-button color="primary" (click)="resetFilters()">
              <mat-icon class="material-symbols-outlined">refresh</mat-icon> Reset
            </button>
          </div>

          <table mat-table [dataSource]="reservations" class="reservation-table">
            <ng-container matColumnDef="customerName">
              <th mat-header-cell *matHeaderCellDef>Customer</th>
              <td mat-cell *matCellDef="let reservation">{{reservation.customer.name}}</td>
            </ng-container>

            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let reservation">{{formatDate(reservation.reservationDate)}}</td>
            </ng-container>

            <ng-container matColumnDef="time">
              <th mat-header-cell *matHeaderCellDef>Time</th>
              <td mat-cell *matCellDef="let reservation">{{formatTime(reservation.reservationDate)}}</td>
            </ng-container>

            <ng-container matColumnDef="partySize">
              <th mat-header-cell *matHeaderCellDef>Party Size</th>
              <td mat-cell *matCellDef="let reservation">{{reservation.partySize}}</td>
            </ng-container>

            <ng-container matColumnDef="table">
              <th mat-header-cell *matHeaderCellDef>Table</th>
              <td mat-cell *matCellDef="let reservation">
                {{getTableInfo(reservation)}}
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let reservation">
                <mat-chip [color]="getStatusColor(reservation.status)" selected>
                  {{reservation.status | titlecase}}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let reservation">
                <a mat-icon-button [routerLink]="['/reservations', reservation._id]" color="primary" matTooltip="View Details">
                  <mat-icon class="material-symbols-outlined">visibility</mat-icon>
                </a>
                <a mat-icon-button [routerLink]="['/reservations/edit', reservation._id]" color="accent" *ngIf="canManageReservations()" matTooltip="Edit">
                  <mat-icon class="material-symbols-outlined">edit</mat-icon>
                </a>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            
            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell" colspan="7" style="text-align: center; padding: 16px;">
                No reservations found
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
    .filter-container {
      display: flex;
      gap: 16px;
      margin-bottom: 20px;
      flex-wrap: wrap;
      align-items: center;
    }
    .reservation-table {
      width: 100%;
    }
    .mat-column-actions {
      width: 120px;
    }
  `]
})
export class ReservationListComponent implements OnInit {
  private reservationService = inject(ReservationService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  reservations: Reservation[] = [];
  displayedColumns: string[] = ['customerName', 'date', 'time', 'partySize', 'table', 'status', 'actions'];
  isLoading = true;
  selectedDate: Date | null = new Date();
  selectedStatus: string = '';

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    this.isLoading = true;
    const dateString = this.selectedDate ? format(this.selectedDate, 'yyyy-MM-dd') : undefined;
    
    this.reservationService.getReservations(dateString, this.selectedStatus || undefined).subscribe({
      next: (response) => {
        this.reservations = response.data.reservations;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading reservations:', error);
        this.snackBar.open(error.error?.message || 'Failed to load reservations', 'Close', { duration: 5000 });
        this.isLoading = false;
      }
    });
  }

  resetFilters(): void {
    this.selectedDate = new Date();
    this.selectedStatus = '';
    this.loadReservations();
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  getTableInfo(reservation: Reservation): string {
    if (!reservation.table) return 'Not assigned';
    if (typeof reservation.table === 'string') return 'Assigned';
    return reservation.table.tableNumber || 'Assigned';
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