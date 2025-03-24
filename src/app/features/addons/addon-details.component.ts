// src/app/features/addons/addon-detail.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { AddonService } from './addon.service';
import { Addon } from './models/addon.model';
import { ConfirmDialogComponent } from '../../shared/generics/cofirm-dialog.component';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-addon-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule
  ],
  template: `
    <div class="container" *ngIf="addon">
      <div class="header-actions">
        <span class="top-label">{{addon.name}}</span>
        <div class="action-buttons">
          <button mat-button color="primary" routerLink="/dashboard/addons">
            <mat-icon class="material-symbols-outlined">arrow_back</mat-icon> Back to List
          </button>
          <button mat-raised-button color="accent" [routerLink]="['/dashboard/addons/edit', addon._id]" *ngIf="canManageAddons()">
            <mat-icon class="material-symbols-outlined">edit</mat-icon> Edit
          </button>
          <button mat-raised-button color="warn" (click)="confirmDelete()" *ngIf="canManageAddons()">
            <mat-icon class="material-symbols-outlined">delete</mat-icon> Delete
          </button>
        </div>
      </div>
      
      <mat-card>
        <mat-card-header>
          <mat-card-title>Addon Details</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="info-row">
            <h3>Selection Type</h3>
            <p>{{ addon.isMultiSelect ? 'Multiple Selection' : 'Single Selection' }}</p>
            <span class="info-hint">{{ addon.isMultiSelect ? 'Customers can select multiple options' : 'Customers can select only one option' }}</span>
          </div>
          
          <mat-divider></mat-divider>
          
          <div class="info-row">
            <h3>Options</h3>
            
            <div class="options-container" *ngIf="addon.subAddons?.length">
              <div class="option-item" *ngFor="let subAddon of addon.subAddons">
                <div class="option-name">{{subAddon.name}}</div>
                <div class="option-price">{{subAddon.price | currency}}</div>
              </div>
            </div>
            
            <p *ngIf="!addon.subAddons?.length">No options available</p>
          </div>
          
          <mat-divider></mat-divider>
          
          <div class="info-row">
            <h3>Created By</h3>
            <p>{{addon.createdBy?.firstName}} {{addon.createdBy?.lastName}}</p>
          </div>
          
          <mat-divider></mat-divider>
          
          <div class="info-row">
            <h3>Created At</h3>
            <p>{{addon.createdAt | date:'medium'}}</p>
          </div>
          
          <mat-divider></mat-divider>
          
          <div class="info-row">
            <h3>Updated At</h3>
            <p>{{addon.updatedAt | date:'medium'}}</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>

    <div class="loading-container" *ngIf="isLoading">
      <p>Loading addon details...</p>
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
    .info-hint {
      display: block;
      font-size: 12px;
      color: #666;
      margin-top: 4px;
    }
    .options-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 12px;
    }
    .option-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 12px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }
    .option-name {
      font-weight: 500;
    }
    .option-price {
      color: #009c4c;
      font-weight: 500;
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
export class AddonDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private addonService = inject(AddonService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  addon: Addon | null = null;
  isLoading = true;
  addonId = '';

  ngOnInit(): void {
    this.addonId = this.route.snapshot.params['id'];
    if (this.addonId) {
      this.loadAddon();
    } else {
      this.router.navigate(['/dashboard/addons']);
    }
  }

  loadAddon(): void {
    this.isLoading = true;
    this.addonService.getAddonById(this.addonId).subscribe({
      next: (response) => {
        this.addon = response.data.addon;
        this.isLoading = false;
      },
      error: (error) => {
        this.snackBar.open(error.error?.message || 'Failed to load addon', 'Close', { duration: 5000 });
        this.isLoading = false;
        this.router.navigate(['/dashboard/addons']);
      }
    });
  }

  confirmDelete(): void {
    if (!this.addon) return;
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Addon',
        message: `Are you sure you want to delete "${this.addon.name}"?`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.deleteAddon();
      }
    });
  }

  deleteAddon(): void {
    if (!this.addon) return;
    
    this.addonService.deleteAddon(this.addon._id).subscribe({
      next: () => {
        this.snackBar.open('Addon deleted successfully', 'Close', { duration: 3000 });
        this.router.navigate(['/dashboard/addons']);
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