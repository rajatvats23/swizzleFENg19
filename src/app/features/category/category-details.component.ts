// src/app/features/categories/category-detail.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CategoryService, Category } from './category.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-category-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule
  ],
  template: `
    <div class="container" *ngIf="category">
      <div class="header-actions">
        <span class="top-label">{{category.name}}</span>
        <div class="action-buttons">
          <button mat-button color="primary" routerLink="/dashboard/categories">
            <mat-icon class="material-symbols-outlined">arrow_back</mat-icon> Back to List
          </button>
          <button mat-raised-button color="accent" [routerLink]="['/dashboard/categories/edit', category._id]" *ngIf="canUpdate()">
            <mat-icon class="material-symbols-outlined">edit</mat-icon> Edit
          </button>
          <button mat-raised-button color="warn" (click)="confirmDelete()" *ngIf="canDelete()">
            <mat-icon class="material-symbols-outlined">delete</mat-icon> Delete
          </button>
        </div>
      </div>
      
      <mat-card>
        <mat-card-content>
          <div class="info-row" *ngIf="category.description">
            <h3>Description</h3>
            <p>{{category.description}}</p>
          </div>
          
          <mat-divider *ngIf="category.description"></mat-divider>
          
          <div class="info-row">
            <h3>Order</h3>
            <p>{{category.order}}</p>
          </div>
          
          <mat-divider></mat-divider>
          
          <div class="info-row">
            <h3>Menus</h3>
            <div class="menu-chips" *ngIf="category.menus && category.menus.length > 0">
              <mat-chip-set>
                <mat-chip *ngFor="let menu of category.menus">{{menu.name}}</mat-chip>
              </mat-chip-set>
            </div>
            <p *ngIf="!category.menus || category.menus.length === 0">No menus assigned</p>
          </div>
          
          <mat-divider></mat-divider>
          
          <div class="info-row">
            <h3>Created By</h3>
            <p>{{category.createdBy?.firstName}} {{category.createdBy?.lastName}}</p>
          </div>
          
          <mat-divider></mat-divider>
          
          <div class="info-row">
            <h3>Created At</h3>
            <p>{{category.createdAt | date:'medium'}}</p>
          </div>
          
          <mat-divider></mat-divider>
          
          <div class="info-row">
            <h3>Updated At</h3>
            <p>{{category.updatedAt | date:'medium'}}</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>

    <div class="loading-container" *ngIf="isLoading">
      <p>Loading category details...</p>
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
    .menu-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 40px;
    }
  `]
})
export class CategoryDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private categoryService = inject(CategoryService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  category: Category | null = null;
  isLoading = true;
  categoryId = '';

  ngOnInit(): void {
    this.categoryId = this.route.snapshot.params['id'];
    if (this.categoryId) {
      this.loadCategory();
    } else {
      this.router.navigate(['/dashboard/categories']);
    }
  }

  loadCategory(): void {
    this.isLoading = true;
    this.categoryService.getCategoryById(this.categoryId).subscribe({
      next: (response) => {
        this.category = response.data.category;
        this.isLoading = false;
      },
      error: (error) => {
        this.snackBar.open(error.error?.message || 'Failed to load category', 'Close', { duration: 5000 });
        this.isLoading = false;
        this.router.navigate(['/dashboard/categories']);
      }
    });
  }

  canUpdate(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.role === 'manager' || user?.role === 'staff';
  }

  canDelete(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.role === 'manager';
  }

  confirmDelete(): void {
    if (confirm(`Are you sure you want to delete "${this.category?.name}"?`)) {
      this.deleteCategory();
    }
  }

  deleteCategory(): void {
    this.categoryService.deleteCategory(this.categoryId).subscribe({
      next: () => {
        this.snackBar.open('Category deleted successfully', 'Close', { duration: 3000 });
        this.router.navigate(['/dashboard/categories']);
      },
      error: (error) => {
        this.snackBar.open(error.error?.message || 'Error deleting category', 'Close', { duration: 5000 });
      }
    });
  }
}