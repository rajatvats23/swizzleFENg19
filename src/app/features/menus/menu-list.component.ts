// src/app/features/menus/menu-list.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MenuService, Menu } from './menu.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-menu-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule
  ],
  template: `
    <div class="menu-container">
      <div class="header-actions">
        <span class="header-title">Menu Management</span>
        <button mat-raised-button color="primary" routerLink="/dashboard/menus/create" *ngIf="isManager()">
          <mat-icon class="material-symbols-outlined">add</mat-icon> Create Menu
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <table mat-table [dataSource]="menus" class="menu-table">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let menu">{{menu.name}}</td>
            </ng-container>

            <ng-container matColumnDef="description">
              <th mat-header-cell *matHeaderCellDef>Description</th>
              <td mat-cell *matCellDef="let menu">{{menu.description || 'N/A'}}</td>
            </ng-container>

            <ng-container matColumnDef="restaurant">
              <th mat-header-cell *matHeaderCellDef>Restaurant</th>
              <td mat-cell *matCellDef="let menu">
                {{menu.restaurantId?.name || 'Unknown'}}
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let menu">
                <button mat-icon-button color="primary" [routerLink]="['/dashboard/menus', menu._id]" matTooltip="View Details">
                  <mat-icon class="material-symbols-outlined">visibility</mat-icon>
                </button>
                <button mat-icon-button color="accent" [routerLink]="['/dashboard/menus/edit', menu._id]" *ngIf="isManager() && canManageMenu(menu)" matTooltip="Edit">
                  <mat-icon class="material-symbols-outlined">edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="confirmDelete(menu)" *ngIf="isManager() && canManageMenu(menu)" matTooltip="Delete">
                  <mat-icon class="material-symbols-outlined">delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            
            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell" colspan="4" style="text-align: center; padding: 16px;">
                No menus found
              </td>
            </tr>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .menu-container {
      width: 100%;
    }
    .header-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .menu-table {
      width: 100%;
    }
  `]
})
export class MenuListComponent implements OnInit {
  private menuService = inject(MenuService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  menus: Menu[] = [];
  displayedColumns: string[] = ['name', 'description', 'restaurant', 'actions'];
  isLoading = false;

  ngOnInit(): void {
    this.loadMenus();
  }

  loadMenus(): void {
    this.isLoading = true;
    this.menuService.getMenus().subscribe({
      next: (response) => {
        this.menus = response.data.menus;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading menus:', error);
        this.snackBar.open(error.error?.message || 'Failed to load menus', 'Close', { duration: 5000 });
        this.isLoading = false;
      }
    });
  }

  isManager(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.role === 'manager';
  }

  canManageMenu(menu: Menu): boolean {
    const user = this.authService.getCurrentUser();
    // Manager can only manage menus of their own restaurant
    return user?.restaurantId === menu.restaurantId._id;
  }

  confirmDelete(menu: Menu): void {
    if (confirm(`Are you sure you want to delete "${menu.name}"?`)) {
      this.deleteMenu(menu._id);
    }
  }

  deleteMenu(id: string): void {
    this.menuService.deleteMenu(id).subscribe({
      next: () => {
        this.snackBar.open('Menu deleted successfully', 'Close', { duration: 3000 });
        this.loadMenus();
      },
      error: (error) => {
        this.snackBar.open(error.error?.message || 'Error deleting menu', 'Close', { duration: 5000 });
      }
    });
  }
}