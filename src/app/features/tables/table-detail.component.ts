// src/app/features/tables/table-detail.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { TableService } from './table.service';
import { Table } from './models/table.model';
import { AuthService } from '../auth/auth.service';
import { ConfirmDialogComponent } from '../../shared/generics/cofirm-dialog.component';
import { QrCodeDialogComponent } from './qr-code-dialog.component';

@Component({
  selector: 'app-table-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  template: `
    <div class="container" *ngIf="table">
      <div class="header-actions">
        <span class="top-label">Table {{table.tableNumber}}</span>
        <div class="action-buttons">
          <button mat-button color="primary" routerLink="/tables">
            <mat-icon class="material-symbols-outlined">arrow_back</mat-icon> Back to List
          </button>
          <button mat-raised-button color="primary" (click)="showQRCode()" matTooltip="Show QR Code">
            <mat-icon class="material-symbols-outlined">qr_code</mat-icon> QR Code
          </button>
          <button mat-raised-button color="accent" [routerLink]="['/tables/edit', table._id]" *ngIf="isManager()">
            <mat-icon class="material-symbols-outlined">edit</mat-icon> Edit
          </button>
          <button mat-raised-button color="warn" (click)="confirmDelete()" *ngIf="isManager()">
            <mat-icon class="material-symbols-outlined">delete</mat-icon> Delete
          </button>
        </div>
      </div>
      
      <div class="detail-grid">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Table Details</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="table-info">
              <div class="info-row">
                <span class="label">Table Number:</span>
                <span>{{table.tableNumber}}</span>
              </div>
              <div class="info-row">
                <span class="label">Capacity:</span>
                <span>{{table.capacity}}</span>
              </div>
              <div class="info-row">
                <span class="label">Status:</span>
                <mat-chip [color]="getStatusColor(table.status)" selected>{{table.status}}</mat-chip>
              </div>
              <div class="info-row">
                <span class="label">Current Occupancy:</span>
                <span>{{table.currentOccupancy}} / {{table.capacity}}</span>
              </div>
              <div class="info-row">
                <span class="label">QR Code Identifier:</span>
                <span>{{table.qrCodeIdentifier}}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-card-title class="mb-3">Update Status</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="statusForm" (ngSubmit)="updateStatus()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Status</mat-label>
                <mat-select formControlName="status">
                  <mat-option value="Available">Available</mat-option>
                  <mat-option value="Reserved">Reserved</mat-option>
                  <mat-option value="Occupied">Occupied</mat-option>
                  <mat-option value="Cleaning">Cleaning</mat-option>
                  <mat-option value="Out of Service">Out of Service</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Current Occupancy</mat-label>
                <input matInput formControlName="currentOccupancy" type="number" min="0" [max]="table.capacity">
                <mat-error *ngIf="statusForm.get('currentOccupancy')?.hasError('min')">Occupancy cannot be negative</mat-error>
                <mat-error *ngIf="statusForm.get('currentOccupancy')?.hasError('max')">Occupancy cannot exceed capacity</mat-error>
              </mat-form-field>

              <div class="form-actions">
                <button mat-raised-button color="primary" type="submit" [disabled]="statusForm.invalid || isSubmitting">
                  {{ isSubmitting ? 'Updating...' : 'Update Status' }}
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </div>

    <div class="loading-container" *ngIf="isLoading">
      <p>Loading table details...</p>
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
    .table-info {
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
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
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
export class TableDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tableService = inject(TableService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  table: Table | null = null;
  isLoading = true;
  isSubmitting = false;
  tableId = '';
  statusForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    
    this.tableId = this.route.snapshot.params['id'];
    if (this.tableId) {
      this.loadTable();
    } else {
      this.router.navigate(['/tables']);
    }
  }

  initForm(): void {
    this.statusForm = this.fb.group({
      status: ['', Validators.required],
      currentOccupancy: [0, [Validators.min(0)]]
    });
  }

  loadTable(): void {
    this.isLoading = true;
    this.tableService.getTableById(this.tableId).subscribe({
      next: (response) => {
        this.table = response.data.table;
        this.statusForm.patchValue({
          status: this.table.status,
          currentOccupancy: this.table.currentOccupancy
        });
        // Add max validator dynamically based on table capacity
        this.statusForm.get('currentOccupancy')?.setValidators([
          Validators.min(0),
          Validators.max(this.table.capacity)
        ]);
        this.statusForm.get('currentOccupancy')?.updateValueAndValidity();
        this.isLoading = false;
      },
      error: (error) => {
        this.snackBar.open(error.error?.message || 'Failed to load table', 'Close', { duration: 5000 });
        this.isLoading = false;
        this.router.navigate(['/tables']);
      }
    });
  }

  updateStatus(): void {
    if (this.statusForm.invalid || !this.table) {
      return;
    }

    this.isSubmitting = true;
    const formData = this.statusForm.value;

    this.tableService.updateTableStatus(this.tableId, formData).subscribe({
      next: (response) => {
        this
        this.table = response.data.table;
        this.snackBar.open('Table status updated successfully', 'Close', { duration: 3000 });
        this.isSubmitting = false;
      },
      error: (error) => {
        this.isSubmitting = false;
        this.snackBar.open(error.error?.message || 'Failed to update table status', 'Close', { duration: 5000 });
      }
    });
  }

  isManager(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.role === 'manager';
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

  showQRCode(): void {
    if (!this.table) return;
    
    this.dialog.open(QrCodeDialogComponent, {
      data: { table: this.table },
      width: '400px'
    });
  }

  confirmDelete(): void {
    if (!this.table) return;
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Table',
        message: `Are you sure you want to delete table "${this.table.tableNumber}"?`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.deleteTable();
      }
    });
  }

  deleteTable(): void {
    if (!this.table) return;
    
    this.tableService.deleteTable(this.tableId).subscribe({
      next: () => {
        this.snackBar.open('Table deleted successfully', 'Close', { duration: 3000 });
        this.router.navigate(['/tables']);
      },
      error: (error) => {
        this.snackBar.open(error.error?.message || 'Error deleting table', 'Close', { duration: 5000 });
      }
    });
  }
}