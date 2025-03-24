// src/app/features/categories/category-list.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { CategoryService, Category } from './category.service';
import { AuthService } from '../auth/auth.service';
import { MenuService } from '../menus/menu.service';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-category-list',
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
    <div class="category-container">
      <div class="header-actions">
        <span class="header-title">Category Management</span>
        <button mat-raised-button color="primary" routerLink="/dashboard/categories/create" *ngIf="canCreate()">
          <mat-icon class="material-symbols-outlined">add</mat-icon> Create Category
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <table mat-table [dataSource]="categories" class="category-table">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let category">{{category.name}}</td>
            </ng-container>

            <ng-container matColumnDef="description">
              <th mat-header-cell *matHeaderCellDef>Description</th>
              <td mat-cell *matCellDef="let category">{{category.description || 'N/A'}}</td>
            </ng-container>

            <ng-container matColumnDef="menus">
              <th mat-header-cell *matHeaderCellDef>Menus</th>
              <td mat-cell *matCellDef="let category">
                <div class="menu-chips">
                  <mat-chip-set>
                    <mat-chip *ngFor="let menu of category.menus">{{menu.name}}</mat-chip>
                  </mat-chip-set>
                  <span *ngIf="!category.menus || category.menus.length === 0">No menus assigned</span>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="order">
              <th mat-header-cell *matHeaderCellDef>Order</th>
              <td mat-cell *matCellDef="let category">{{category.order}}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let category">
                <button mat-icon-button color="primary" [routerLink]="['/dashboard/categories', category._id]" matTooltip="View Details">
                  <mat-icon class="material-symbols-outlined">visibility</mat-icon>
                </button>
                <button mat-icon-button color="accent" [routerLink]="['/dashboard/categories/edit', category._id]" *ngIf="canUpdate()" matTooltip="Edit">
                  <mat-icon class="material-symbols-outlined">edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="confirmDelete(category)" *ngIf="canDelete()" matTooltip="Delete">
                  <mat-icon class="material-symbols-outlined">delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            
            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell" colspan="5" style="text-align: center; padding: 16px;">
                No categories found
              </td>
            </tr>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .category-container {
      width: 100%;
    }
    .header-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .category-table {
      width: 100%;
    }
    .menu-chips {
      max-width: 300px;
      overflow: hidden;
    }
  `]
})
export class CategoryListComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  categories: Category[] = [];
  displayedColumns: string[] = ['name', 'description', 'menus', 'order', 'actions'];
  isLoading = false;

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.categoryService.getCategories().subscribe({
      next: (response) => {
        this.categories = response.data.categories;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.snackBar.open(error.error?.message || 'Failed to load categories', 'Close', { duration: 5000 });
        this.isLoading = false;
      }
    });
  }

  canCreate(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.role === 'manager';
  }

  canUpdate(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.role === 'manager' || user?.role === 'staff';
  }

  canDelete(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.role === 'manager';
  }

  confirmDelete(category: Category): void {
    if (confirm(`Are you sure you want to delete "${category.name}"?`)) {
      this.deleteCategory(category._id);
    }
  }

  deleteCategory(id: string): void {
    this.categoryService.deleteCategory(id).subscribe({
      next: () => {
        this.snackBar.open('Category deleted successfully', 'Close', { duration: 3000 });
        this.loadCategories();
      },
      error: (error) => {
        this.snackBar.open(error.error?.message || 'Error deleting category', 'Close', { duration: 5000 });
      }
    });
  }
}