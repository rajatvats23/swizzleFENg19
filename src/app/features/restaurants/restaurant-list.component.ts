// src/app/features/restaurants/restaurant-list.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RestaurantService } from './restaurant.service';
import { Restaurant } from './models/restaurant.model';
import { ConfirmDialogComponent } from '../../shared/generics/cofirm-dialog.component';
import { RestaurantDialogService } from './restaurant-dialog.service';

@Component({
  selector: 'app-restaurant-list',
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
    MatProgressBarModule,
    MatTooltipModule
  ],
  template: `
    <div class="container">
      <div class="header-actions">
        <span class="header-title">Restaurant Management</span >
        <button mat-raised-button color="primary" (click)="openCreateDialog()">
          <mat-icon class="material-symbols-outlined">add</mat-icon> Add Restaurant
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <table mat-table [dataSource]="restaurants" class="restaurant-table">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let restaurant">{{restaurant.name}}</td>
            </ng-container>

            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef>Email</th>
              <td mat-cell *matCellDef="let restaurant">{{restaurant.email}}</td>
            </ng-container>

            <ng-container matColumnDef="location">
              <th mat-header-cell *matHeaderCellDef>Location</th>
              <td mat-cell *matCellDef="let restaurant">{{restaurant.city}}, {{restaurant.country}}</td>
            </ng-container>

            <ng-container matColumnDef="manager">
              <th mat-header-cell *matHeaderCellDef>Manager</th>
              <td mat-cell *matCellDef="let restaurant">{{restaurant.managerEmail}}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let restaurant">
                <mat-chip [color]="getStatusColor(restaurant.status)" selected>
                  {{restaurant.status | titlecase}}
                </mat-chip>
              </td>
            </ng-container>
            
            <ng-container matColumnDef="completion">
              <th mat-header-cell *matHeaderCellDef>Completion</th>
              <td mat-cell *matCellDef="let restaurant">
                <mat-progress-bar [value]="restaurant.completionPercentage" [color]="getProgressColor(restaurant.completionPercentage)"></mat-progress-bar>
                <span class="completion-text">{{restaurant.completionPercentage}}%</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let restaurant">
                <a mat-icon-button [routerLink]="['/dashboard/restaurants', restaurant._id]" color="primary" matTooltip="View Details">
                  <mat-icon>visibility</mat-icon>
                </a>
                <button mat-icon-button color="accent" (click)="openEditDialog(restaurant)" matTooltip="Edit">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="confirmDelete(restaurant)" matTooltip="Delete">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            
            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell" colspan="7" style="text-align: center; padding: 16px;">
                No restaurants found
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
    .restaurant-table {
      width: 100%;
    }
    .completion-text {
      margin-left: 8px;
      font-size: 12px;
    }
    .mat-column-actions {
      width: 120px;
    }
    .mat-column-completion {
      width: 150px;
    }
  `]
})
export class RestaurantListComponent implements OnInit {
  private restaurantService = inject(RestaurantService);
  private dialogService = inject(RestaurantDialogService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  restaurants: Restaurant[] = [];
  displayedColumns: string[] = ['name', 'email', 'location', 'manager', 'status', 'completion', 'actions'];
  isLoading = false;

  ngOnInit(): void {
    this.loadRestaurants();
  }

  loadRestaurants(): void {
    this.isLoading = true;
    this.restaurantService.getRestaurants().subscribe({
      next: (response) => {
        this.restaurants = response.data.restaurants;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading restaurants:', error);
        this.snackBar.open(error.error?.message || 'Failed to load restaurants', 'Close', { duration: 5000 });
        this.isLoading = false;
      }
    });
  }

  openCreateDialog(): void {
    this.dialogService.openCreateDialog().subscribe((result) => {
      if (result) {
        this.loadRestaurants();
      }
    });
  }

  openEditDialog(restaurant: Restaurant): void {
    this.dialogService.openEditDialog(restaurant).subscribe((result) => {
      if (result) {
        this.loadRestaurants();
      }
    });
  }

  confirmDelete(restaurant: Restaurant): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Restaurant',
        message: `Are you sure you want to delete "${restaurant.name}"?`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.deleteRestaurant(restaurant._id);
      }
    });
  }

  deleteRestaurant(id: string): void {
    this.restaurantService.deleteRestaurant(id).subscribe({
      next: () => {
        this.snackBar.open('Restaurant deleted successfully', 'Close', { duration: 3000 });
        this.loadRestaurants();
      },
      error: (error) => {
        this.snackBar.open(error.error?.message || 'Error deleting restaurant', 'Close', { duration: 5000 });
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'primary';
      case 'inactive': return 'warn';
      default: return 'accent';
    }
  }

  getProgressColor(percentage: number): string {
    if (percentage < 30) return 'warn';
    if (percentage < 70) return 'accent';
    return 'primary';
  }
}