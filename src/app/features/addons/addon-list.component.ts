// src/app/features/addons/addon-list.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { AddonService } from './addon.service';
import { Addon } from './models/addon.model';
import { ConfirmDialogComponent } from '../../shared/generics/cofirm-dialog.component';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-addon-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatChipsModule
  ],
  template: `
    <div class="addon-container">
      <div class="header-actions">
        <span class="header-title">Addon Management</span>
        <button mat-raised-button color="primary" routerLink="/dashboard/addons/create" *ngIf="canManageAddons()">
          <mat-icon class="material-symbols-outlined">add</mat-icon> Create Addon
        </button>
      </div>

      <table mat-table [dataSource]="addons" class="addon-table">
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Name</th>
          <td mat-cell *matCellDef="let addon">{{addon.name}}</td>
        </ng-container>

        <ng-container matColumnDef="type">
          <th mat-header-cell *matHeaderCellDef>Selection Type</th>
          <td mat-cell *matCellDef="let addon">
            <span class="selection-type">
              {{addon.isMultiSelect ? 'Multiple Select' : 'Single Select'}}
            </span>
          </td>
        </ng-container>

        <ng-container matColumnDef="options">
          <th mat-header-cell *matHeaderCellDef>Options</th>
          <td mat-cell *matCellDef="let addon">
            <mat-chip-set *ngIf="addon.subAddons?.length">
              <mat-chip *ngFor="let subAddon of addon.subAddons">
                {{subAddon.name}} ({{subAddon.price | currency}})
              </mat-chip>
            </mat-chip-set>
            <span *ngIf="!addon.subAddons?.length">No options</span>
          </td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let addon">
            <a mat-icon-button [routerLink]="['/dashboard/addons', addon._id]" color="primary" matTooltip="View Details">
              <mat-icon class="material-symbols-outlined">visibility</mat-icon>
            </a>
            <a mat-icon-button [routerLink]="['/dashboard/addons/edit', addon._id]" color="accent" *ngIf="canManageAddons()" matTooltip="Edit">
              <mat-icon class="material-symbols-outlined">edit</mat-icon>
            </a>
            <button mat-icon-button color="warn" (click)="confirmDelete(addon)" *ngIf="canManageAddons()" matTooltip="Delete">
              <mat-icon class="material-symbols-outlined">delete</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        
        <tr class="mat-row" *matNoDataRow>
          <td class="mat-cell" [attr.colspan]="displayedColumns.length" style="text-align: center; padding: 16px;">
            No addons found
          </td>
        </tr>
      </table>
    </div>
  `,
  styles: [`
    .addon-container {
      width: 100%;
    }
    .header-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .addon-table {
      width: 100%;
    }
    .selection-type {
      padding: 4px 8px;
      border-radius: 4px;
      background-color: #f5f5f5;
      font-size: 12px;
    }
  `]
})
export class AddonListComponent implements OnInit {
  private addonService = inject(AddonService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  addons: Addon[] = [];
  displayedColumns: string[] = ['name', 'type', 'options', 'actions'];
  isLoading = false;

  ngOnInit(): void {
    this.loadAddons();
  }

  loadAddons(): void {
    this.isLoading = true;
    this.addonService.getAddons().subscribe({
      next: (response) => {
        this.addons = response.data.addons;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading addons:', error);
        this.snackBar.open(error.error?.message || 'Failed to load addons', 'Close', { duration: 5000 });
        this.isLoading = false;
      }
    });
  }

  confirmDelete(addon: Addon): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Addon',
        message: `Are you sure you want to delete "${addon.name}"?`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.deleteAddon(addon._id);
      }
    });
  }

  deleteAddon(id: string): void {
    this.addonService.deleteAddon(id).subscribe({
      next: () => {
        this.snackBar.open('Addon deleted successfully', 'Close', { duration: 3000 });
        this.loadAddons();
      },
      error: (error) => {
        this.snackBar.open(error.error?.message || 'Error deleting addon', 'Close', { duration: 5000 });
      }
    });
  }

  canManageAddons(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.role === 'manager';
  }
}