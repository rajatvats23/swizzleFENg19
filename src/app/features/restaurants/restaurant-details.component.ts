// src/app/features/restaurants/restaurant-detail.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RestaurantService } from './restaurant.service';
import { Restaurant } from './models/restaurant.model';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-restaurant-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressBarModule
  ],
  template: `
    <div class="container" *ngIf="restaurant">
      <div class="header-actions">
        <h1>{{restaurant.name}}</h1>
        <div class="action-buttons">
          <button mat-button color="primary" routerLink="/dashboard/restaurants">
            <mat-icon>arrow_back</mat-icon> Back to List
          </button>
          <button mat-raised-button color="accent" [routerLink]="['/dashboard/restaurants', restaurant._id, 'edit']">
            <mat-icon>edit</mat-icon> Edit
          </button>
          <button mat-raised-button color="warn" (click)="confirmDelete()" *ngIf="isAdminOrSuperAdmin()">
            <mat-icon>delete</mat-icon> Delete
          </button>
        </div>
      </div>
      
      <div class="status-container">
        <mat-progress-bar [value]="restaurant.completionPercentage" [color]="getProgressColor(restaurant.completionPercentage)"></mat-progress-bar>
        <div class="status-info">
          <span>Profile Completion: {{restaurant.completionPercentage}}%</span>
          <mat-chip [color]="getStatusColor(restaurant.status)" selected>{{restaurant.status | titlecase}}</mat-chip>
        </div>
      </div>
      
      <div class="detail-grid">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Basic Information</mat-card-title>
          </mat-card-header>
          <mat-divider></mat-divider>
          <mat-card-content>
            <div class="info-row">
              <span class="label">Name:</span>
              <span>{{restaurant.name}}</span>
            </div>
            <div class="info-row">
              <span class="label">Email:</span>
              <span>{{restaurant.email}}</span>
            </div>
            <div class="info-row">
              <span class="label">Phone:</span>
              <span>{{restaurant.phone}}</span>
            </div>
            <div class="info-row">
              <span class="label">Manager:</span>
              <span>{{restaurant.managerEmail}}</span>
            </div>
          </mat-card-content>
        </mat-card>
        
        <mat-card>
          <mat-card-header>
            <mat-card-title>Location</mat-card-title>
          </mat-card-header>
          <mat-divider></mat-divider>
          <mat-card-content>
            <div class="info-row">
              <span class="label">Address:</span>
              <span>{{restaurant.address}}</span>
            </div>
            <div class="info-row">
              <span class="label">City:</span>
              <span>{{restaurant.city}}</span>
            </div>
            <div class="info-row" *ngIf="restaurant.state">
              <span class="label">State/Province:</span>
              <span>{{restaurant.state}}</span>
            </div>
            <div class="info-row" *ngIf="restaurant.zipCode">
              <span class="label">Postal Code:</span>
              <span>{{restaurant.zipCode}}</span>
            </div>
            <div class="info-row">
              <span class="label">Country:</span>
              <span>{{restaurant.country}}</span>
            </div>
          </mat-card-content>
        </mat-card>
        
        <mat-card *ngIf="hasAdditionalDetails()">
          <mat-card-header>
            <mat-card-title>Additional Details</mat-card-title>
          </mat-card-header>
          <mat-divider></mat-divider>
          <mat-card-content>
            <div class="info-row" *ngIf="restaurant.description">
              <span class="label">Description:</span>
              <span>{{restaurant.description}}</span>
            </div>
            <div class="info-row" *ngIf="restaurant.cuisineType">
              <span class="label">Cuisine Type:</span>
              <span>{{restaurant.cuisineType}}</span>
            </div>
            <div class="info-row" *ngIf="restaurant.website">
              <span class="label">Website:</span>
              <span><a [href]="restaurant.website" target="_blank">{{restaurant.website}}</a></span>
            </div>
          </mat-card-content>
        </mat-card>
        
        <mat-card *ngIf="restaurant.operatingHours">
          <mat-card-header>
            <mat-card-title>Operating Hours</mat-card-title>
          </mat-card-header>
          <mat-divider></mat-divider>
          <mat-card-content>
            <div class="info-row" *ngIf="restaurant.operatingHours?.monday">
              <span class="label">Monday:</span>
              <span>{{getHoursDisplay(restaurant.operatingHours.monday)}}</span>
            </div>
            <div class="info-row" *ngIf="restaurant.operatingHours?.tuesday">
              <span class="label">Tuesday:</span>
              <span>{{getHoursDisplay(restaurant.operatingHours.tuesday)}}</span>
            </div>
            <div class="info-row" *ngIf="restaurant.operatingHours?.wednesday">
              <span class="label">Wednesday:</span>
              <span>{{getHoursDisplay(restaurant.operatingHours.wednesday)}}</span>
            </div>
            <div class="info-row" *ngIf="restaurant.operatingHours?.thursday">
              <span class="label">Thursday:</span>
              <span>{{getHoursDisplay(restaurant.operatingHours.thursday)}}</span>
            </div>
            <div class="info-row" *ngIf="restaurant.operatingHours?.friday">
              <span class="label">Friday:</span>
              <span>{{getHoursDisplay(restaurant.operatingHours.friday)}}</span>
            </div>
            <div class="info-row" *ngIf="restaurant.operatingHours?.saturday">
              <span class="label">Saturday:</span>
              <span>{{getHoursDisplay(restaurant.operatingHours.saturday)}}</span>
            </div>
            <div class="info-row" *ngIf="restaurant.operatingHours?.sunday">
              <span class="label">Sunday:</span>
              <span>{{getHoursDisplay(restaurant.operatingHours.sunday)}}</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>

    <div class="loading-container" *ngIf="isLoading">
      <p>Loading restaurant details...</p>
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
    .status-container {
      background-color: white;
      border-radius: 4px;
      padding: 16px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .status-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 10px;
    }
    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }
    .info-row {
      margin-bottom: 12px;
    }
    .label {
      font-weight: 500;
      color: #666;
      display: block;
      margin-bottom: 4px;
    }
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 40px;
    }
    @media (max-width: 600px) {
      .header-actions {
        flex-direction: column;
        align-items: flex-start;
      }
      .action-buttons {
        margin-top: 10px;
      }
    }
  `]
})
export class RestaurantDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private restaurantService = inject(RestaurantService);
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);

  restaurant: Restaurant | null = null;
  isLoading = true;
  restaurantId = '';

  ngOnInit(): void {
    this.restaurantId = this.route.snapshot.params['id'];
    if (this.restaurantId) {
      this.loadRestaurant();
    } else {
      this.router.navigate(['/dashboard/restaurants']);
    }
  }

  loadRestaurant(): void {
    this.isLoading = true;
    this.restaurantService.getRestaurantById(this.restaurantId).subscribe({
      next: (response) => {
        this.restaurant = response.data.restaurant;
        this.isLoading = false;
      },
      error: (error) => {
        this.snackBar.open(error.error?.message || 'Failed to load restaurant', 'Close', { duration: 5000 });
        this.isLoading = false;
        this.router.navigate(['/dashboard/restaurants']);
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

  getHoursDisplay(hours: { open?: string; close?: string } | undefined): string {
    if (!hours || !hours.open || !hours.close) {
      return 'Closed';
    }
    return `${hours.open} - ${hours.close}`;
  }

  hasAdditionalDetails(): boolean {
    return !!(
      this.restaurant?.description ||
      this.restaurant?.cuisineType ||
      this.restaurant?.website
    );
  }

  isAdminOrSuperAdmin(): boolean {
    const user = this.authService.getTempUserInfo();
    return user?.role === 'admin' || user?.role === 'superadmin';
  }

  confirmDelete(): void {
    if (confirm(`Are you sure you want to delete "${this.restaurant?.name}"?`)) {
      this.deleteRestaurant();
    }
  }

  deleteRestaurant(): void {
    this.restaurantService.deleteRestaurant(this.restaurantId).subscribe({
      next: () => {
        this.snackBar.open('Restaurant deleted successfully', 'Close', { duration: 3000 });
        this.router.navigate(['/dashboard/restaurants']);
      },
      error: (error) => {
        this.snackBar.open(error.error?.message || 'Error deleting restaurant', 'Close', { duration: 5000 });
      }
    });
  }
}