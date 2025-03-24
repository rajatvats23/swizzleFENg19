// src/app/features/products/product-detail.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ProductService } from './product.service';
import { AuthService } from '../auth/auth.service';
import { ConfirmDialogComponent } from '../../shared/generics/cofirm-dialog.component';
import { Product } from './product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatSlideToggleModule
  ],
  template: `
    <div class="container" *ngIf="product">
      <div class="header-actions">
        <span class="top-label">{{product.name}}</span>
        <div class="action-buttons">
          <button mat-button color="primary" routerLink="/dashboard/products">
            <mat-icon class="material-symbols-outlined">arrow_back</mat-icon> Back to List
          </button>
          <button mat-raised-button color="accent" [routerLink]="['/dashboard/products/edit', product._id]" *ngIf="canManageProducts()">
            <mat-icon class="material-symbols-outlined">edit</mat-icon> Edit
          </button>
          <button mat-raised-button color="warn" (click)="confirmDelete()" *ngIf="canManageProducts()">
            <mat-icon class="material-symbols-outlined">delete</mat-icon> Delete
          </button>
        </div>
      </div>
      
      <div class="product-grid">
        <div class="product-image-section">
          <mat-card>
            <mat-card-content class="product-image-container">
              <img *ngIf="product.imageUrl" [src]="product.imageUrl" alt="{{product.name}}" class="product-image">
              <div *ngIf="!product.imageUrl" class="no-image">
                <mat-icon class="material-symbols-outlined">image_not_supported</mat-icon>
                <p>No image available</p>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
        
        <div class="product-details-section">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Product Details</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="price-availability">
                <div class="price">{{product.price | currency}}</div>
                <div class="availability">
                  <mat-slide-toggle 
                    [checked]="product.isAvailable" 
                    (change)="toggleAvailability($event.checked)"
                    [disabled]="!canManageProducts()"
                  >
                    {{ product.isAvailable ? 'Available' : 'Unavailable' }}
                  </mat-slide-toggle>
                </div>
              </div>
              
              <mat-divider></mat-divider>
              
              <div class="info-row" *ngIf="product.description">
                <h3>Description</h3>
                <p>{{product.description}}</p>
              </div>
              
              <mat-divider *ngIf="product.description"></mat-divider>
              
              <div class="info-row">
                <h3>Category</h3>
                <p>{{product.category?.name || 'Not assigned'}}</p>
              </div>
              
              <mat-divider></mat-divider>
              
              <div class="info-row">
                <h3>Tags</h3>
                <mat-chip-set *ngIf="product.tags?.length">
                  <mat-chip *ngFor="let tag of product.tags">{{tag.name}}</mat-chip>
                </mat-chip-set>
                <p *ngIf="!product.tags?.length">No tags</p>
              </div>
              
              <mat-divider></mat-divider>
              
              <div class="info-row">
                <h3>Created By</h3>
                <p>{{product.createdBy?.firstName}} {{product.createdBy?.lastName}}</p>
              </div>
              
              <mat-divider></mat-divider>
              
              <div class="info-row">
                <h3>Created At</h3>
                <p>{{product.createdAt | date:'medium'}}</p>
              </div>
              
              <mat-divider></mat-divider>
              
              <div class="info-row">
                <h3>Updated At</h3>
                <p>{{product.updatedAt | date:'medium'}}</p>
              </div>

              <div class="info-row" *ngIf="product.addons?.length">
  <h3>Addons</h3>
  <div class="addon-list">
    <div class="addon-item" *ngFor="let productAddon of product.addons">
      <div class="addon-name">{{productAddon.addon.name}}</div>
      <div class="addon-required" *ngIf="productAddon.required">Required</div>
    </div>
  </div>
</div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>

    <div class="loading-container" *ngIf="isLoading">
      <p>Loading product details...</p>
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
    .product-grid {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 20px;
    }
    .product-image-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 300px;
      padding: 16px;
    }
    .product-image {
      max-width: 100%;
      max-height: 400px;
      object-fit: contain;
    }
    .no-image {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #999;
    }
    .no-image mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
    }
    .price-availability {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
    }
    .price {
      font-size: 24px;
      font-weight: 500;
      color: #009c4c;
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
    @media (max-width: 767px) {
      .product-grid {
        grid-template-columns: 1fr;
      }
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
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  product: Product | null = null;
  isLoading = true;
  productId = '';

  ngOnInit(): void {
    this.productId = this.route.snapshot.params['id'];
    if (this.productId) {
      this.loadProduct();
    } else {
      this.router.navigate(['/dashboard/products']);
    }
  }

  loadProduct(): void {
    this.isLoading = true;
    this.productService.getProductById(this.productId).subscribe({
      next: (response) => {
        this.product = response.data.product;
        this.isLoading = false;
      },
      error: (error) => {
        this.snackBar.open(error.error?.message || 'Failed to load product', 'Close', { duration: 5000 });
        this.isLoading = false;
        this.router.navigate(['/dashboard/products']);
      }
    });
  }

  toggleAvailability(isAvailable: boolean): void {
    if (!this.product) return;

    this.productService.updateProduct(this.product._id, { isAvailable }).subscribe({
      next: (response) => {
        if (this.product) {
          this.product.isAvailable = isAvailable;
        }
        this.snackBar.open(`Product ${isAvailable ? 'enabled' : 'disabled'} successfully`, 'Close', { duration: 3000 });
      },
      error: (error) => {
        // Revert toggle in UI if update fails
        if (this.product) {
          this.product.isAvailable = !isAvailable;
        }
        this.snackBar.open(error.error?.message || 'Failed to update product', 'Close', { duration: 5000 });
      }
    });
  }

  confirmDelete(): void {
    if (!this.product) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Product',
        message: `Are you sure you want to delete "${this.product.name}"?`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.deleteProduct();
      }
    });
  }

  deleteProduct(): void {
    if (!this.product) return;

    this.productService.deleteProduct(this.product._id).subscribe({
      next: () => {
        this.snackBar.open('Product deleted successfully', 'Close', { duration: 3000 });
        this.router.navigate(['/dashboard/products']);
      },
      error: (error) => {
        this.snackBar.open(error.error?.message || 'Error deleting product', 'Close', { duration: 5000 });
      }
    });
  }

  canManageProducts(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.role === 'manager';
  }
}