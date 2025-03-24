// src/app/features/menus/menu-detail.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MenuService, Menu } from './menu.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-menu-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  template: `
    <div class="container" *ngIf="menu">
      <div class="header-actions">
        <h1>{{menu.name}}</h1>
        <div class="action-buttons">
          <button mat-button color="primary" routerLink="/dashboard/menus">
            <mat-icon class="material-symbols-outlined">arrow_back</mat-icon> Back to List
          </button>
          <button mat-raised-button color="accent" [routerLink]="['/dashboard/menus/edit', menu._id]" *ngIf="canManageMenu()">
            <mat-icon class="material-symbols-outlined">edit</mat-icon> Edit
          </button>
          <button mat-raised-button color="warn" (click)="confirmDelete()" *ngIf="canManageMenu()">
            <mat-icon class="material-symbols-outlined">delete</mat-icon> Delete
          </button>
        </div>
      </div>
      
      <mat-card>
        <mat-card-content>
          <div class="info-row" *ngIf="menu.description">
            <h3>Description</h3>
            <p>{{menu.description}}</p>
          </div>
          
          <mat-divider *ngIf="menu.description"></mat-divider>
          
          <div class="info-row">
            <h3>Restaurant</h3>
            <p>{{menu.restaurantId?.name || 'Unknown'}}</p>
          </div>
          
          <mat-divider></mat-divider>
          
          <div class="info-row">
            <h3>Created By</h3>
            <p>{{menu.createdBy?.firstName}} {{menu.createdBy?.lastName}}</p>
          </div>
          
          <mat-divider></mat-divider>
          
          <div class="info-row">
            <h3>Created At</h3>
            <p>{{menu.createdAt | date:'medium'}}</p>
          </div>
          
          <mat-divider></mat-divider>
          
          <div class="info-row">
            <h3>Updated At</h3>
            <p>{{menu.updatedAt | date:'medium'}}</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>

    <div class="loading-container" *ngIf="isLoading">
      <p>Loading menu details...</p>
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
    .info-row {
      padding: 16px 0;
    }
    .info-row h3 {
      margin: 0 0 8px 0;
      font-weight: 500;
      color: #666;
    }
    .info-row p {
      margin: 0;
    }
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 40px;
    }
  `]
})
export class MenuDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private menuService = inject(MenuService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  menu: Menu | null = null;
  isLoading = true;
  menuId = '';

  ngOnInit(): void {
    this.menuId = this.route.snapshot.params['id'];
    if (this.menuId) {
      this.loadMenu();
    } else {
      this.router.navigate(['/dashboard/menus']);
    }
  }

  loadMenu(): void {
    this.isLoading = true;
    this.menuService.getMenuById(this.menuId).subscribe({
      next: (response) => {
        this.menu = response.data.menu;
        this.isLoading = false;
      },
      error: (error) => {
        this.snackBar.open(error.error?.message || 'Failed to load menu', 'Close', { duration: 5000 });
        this.isLoading = false;
        this.router.navigate(['/dashboard/menus']);
      }
    });
  }

  canManageMenu(): boolean {
    if (!this.menu) return false;
    
    const user = this.authService.getCurrentUser();
    if (!user) return false;
    
    // Only managers can manage menus
    if (user.role !== 'manager') return false;
    
    // Manager can only manage menus of their own restaurant
    return user.restaurantId === this.menu.restaurantId._id;
  }

  confirmDelete(): void {
    if (confirm(`Are you sure you want to delete "${this.menu?.name}"?`)) {
      this.deleteMenu();
    }
  }

  deleteMenu(): void {
    this.menuService.deleteMenu(this.menuId).subscribe({
      next: () => {
        this.snackBar.open('Menu deleted successfully', 'Close', { duration: 3000 });
        this.router.navigate(['/dashboard/menus']);
      },
      error: (error) => {
        this.snackBar.open(error.error?.message || 'Error deleting menu', 'Close', { duration: 5000 });
      }
    });
  }
}