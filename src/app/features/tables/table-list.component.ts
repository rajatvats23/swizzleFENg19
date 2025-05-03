// src/app/features/tables/table-list.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TableService } from './table.service';
import { Table } from './models/table.model';
import { ConfirmDialogComponent } from '../../shared/generics/cofirm-dialog.component';
import { AuthService } from '../auth/auth.service';
import { QrCodeDialogComponent } from './qr-code-dialog.component';

@Component({
  selector: 'app-table-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDialogModule,
    MatTooltipModule
  ],
  template: `
    <div class="container">
      <div class="header-actions">
        <span class="header-title">Table Management</span>
        <button mat-raised-button color="primary" routerLink="/tables/create" *ngIf="isManager()">
          <mat-icon class="material-symbols-outlined">add</mat-icon> Add Table
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <table mat-table [dataSource]="tables" class="table-table">
            <ng-container matColumnDef="tableNumber">
              <th mat-header-cell *matHeaderCellDef>Table Number</th>
              <td mat-cell *matCellDef="let table">{{table.tableNumber}}</td>
            </ng-container>

            <ng-container matColumnDef="capacity">
              <th mat-header-cell *matHeaderCellDef>Capacity</th>
              <td mat-cell *matCellDef="let table">{{table.capacity}}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let table">
                <mat-chip [color]="getStatusColor(table.status)" selected>
                  {{table.status}}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="occupancy">
              <th mat-header-cell *matHeaderCellDef>Occupancy</th>
              <td mat-cell *matCellDef="let table">{{table.currentOccupancy}} / {{table.capacity}}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let table">
                <button mat-icon-button color="primary" (click)="showQRCode(table)" matTooltip="Show QR Code">
                  <mat-icon class="material-symbols-outlined">qr_code</mat-icon>
                </button>
                <a mat-icon-button [routerLink]="['/tables', table._id]" color="primary" matTooltip="View Details">
                  <mat-icon class="material-symbols-outlined">visibility</mat-icon>
                </a>
                <a mat-icon-button [routerLink]="['/tables/edit', table._id]" color="accent" *ngIf="isManager()" matTooltip="Edit">
                  <mat-icon class="material-symbols-outlined">edit</mat-icon>
                </a>
                <button mat-icon-button color="warn" (click)="confirmDelete(table)" *ngIf="isManager()" matTooltip="Delete">
                  <mat-icon class="material-symbols-outlined">delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            
            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell" colspan="5" style="text-align: center; padding: 16px;">
                No tables found
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
    .table-table {
      width: 100%;
    }
    .mat-column-actions {
      width: 150px;
    }
  `]
})
export class TableListComponent implements OnInit {
  private tableService = inject(TableService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  tables: Table[] = [];
  displayedColumns: string[] = ['tableNumber', 'capacity', 'status', 'occupancy', 'actions'];
  isLoading = false;

  ngOnInit(): void {
    this.loadTables();
  }

  loadTables(): void {
    this.isLoading = true;
    this.tableService.getTables().subscribe({
      next: (response) => {
        this.tables = response.data.tables;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading tables:', error);
        this.snackBar.open(error.error?.message || 'Failed to load tables', 'Close', { duration: 5000 });
        this.isLoading = false;
      }
    });
  }

  isManager(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.role === 'manager';
  }

  showQRCode(table: Table): void {
    this.dialog.open(QrCodeDialogComponent, {
      data: { table },
      width: '400px'
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

  confirmDelete(table: Table): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Table',
        message: `Are you sure you want to delete table "${table.tableNumber}"?`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.deleteTable(table._id);
      }
    });
  }

  deleteTable(id: string): void {
    this.tableService.deleteTable(id).subscribe({
      next: () => {
        this.snackBar.open('Table deleted successfully', 'Close', { duration: 3000 });
        this.loadTables();
      },
      error: (error) => {
        this.snackBar.open(error.error?.message || 'Error deleting table', 'Close', { duration: 5000 });
      }
    });
  }
}