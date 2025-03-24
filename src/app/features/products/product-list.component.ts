import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { ProductService } from './product.service';
import { CategoryService } from '../category/category.service';
import { ConfirmDialogComponent } from '../../shared/generics/cofirm-dialog.component';
import { AuthService } from '../auth/auth.service';
import { TagService } from '../tag/tag.service';
import { Product } from './product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatChipsModule
  ],
  template: `
    <div class="product-container">
      <div class="header-actions">
        <span class="header-title">Product Management</span>
        <button mat-raised-button color="primary" routerLink="/dashboard/products/create" *ngIf="canManageProducts()">
          <mat-icon class="material-symbols-outlined">add</mat-icon> Add Product
        </button>
      </div>

      <mat-card class="filter-card">
        <mat-card-content>
          <form [formGroup]="filterForm" class="filter-form">
            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Search</mat-label>
              <input matInput formControlName="search" placeholder="Search products...">
              <mat-icon class="material-symbols-outlined" matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Category</mat-label>
              <mat-select formControlName="category">
                <mat-option value="">All Categories</mat-option>
                <mat-option *ngFor="let category of categories" [value]="category._id">
                  {{category.name}}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Tag</mat-label>
              <mat-select formControlName="tag">
                <mat-option value="">All Tags</mat-option>
                <mat-option *ngFor="let tag of tags" [value]="tag._id">
                  {{tag.name}}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <div class="price-range">
              <mat-form-field appearance="outline" class="filter-field">
                <mat-label>Min Price</mat-label>
                <input matInput type="number" formControlName="minPrice" min="0">
              </mat-form-field>

              <mat-form-field appearance="outline" class="filter-field">
                <mat-label>Max Price</mat-label>
                <input matInput type="number" formControlName="maxPrice" min="0">
              </mat-form-field>
            </div>

            <div class="filter-actions">
              <button mat-button type="button" (click)="resetFilters()">Reset</button>
              <button mat-raised-button color="primary" type="button" (click)="applyFilters()">Apply Filters</button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <table mat-table [dataSource]="products" class="product-table">
        <ng-container matColumnDef="image">
          <th mat-header-cell *matHeaderCellDef>Image</th>
          <td mat-cell *matCellDef="let product">
            <img 
              *ngIf="product.imageUrl" 
              [src]="product.imageUrl" 
              alt="Product image" 
              class="product-image"
            >
            <div *ngIf="!product.imageUrl" class="no-image">
              <mat-icon class="material-symbols-outlined">image_not_supported</mat-icon>
            </div>
          </td>
        </ng-container>

        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Name</th>
          <td mat-cell *matCellDef="let product">{{product.name}}</td>
        </ng-container>

        <ng-container matColumnDef="price">
          <th mat-header-cell *matHeaderCellDef>Price</th>
          <td mat-cell *matCellDef="let product">{{product.price | currency}}</td>
        </ng-container>

        <ng-container matColumnDef="category">
          <th mat-header-cell *matHeaderCellDef>Category</th>
          <td mat-cell *matCellDef="let product">{{product.category?.name || 'N/A'}}</td>
        </ng-container>

        <ng-container matColumnDef="tags">
          <th mat-header-cell *matHeaderCellDef>Tags</th>
          <td mat-cell *matCellDef="let product">
            <mat-chip-set *ngIf="product.tags?.length">
              <mat-chip *ngFor="let tag of product.tags">{{tag.name}}</mat-chip>
            </mat-chip-set>
            <span *ngIf="!product.tags?.length">None</span>
          </td>
        </ng-container>

        <ng-container matColumnDef="availability">
          <th mat-header-cell *matHeaderCellDef>Available</th>
          <td mat-cell *matCellDef="let product">
            <mat-slide-toggle 
              [checked]="product.isAvailable" 
              (change)="toggleAvailability(product, $event.checked)"
              [disabled]="!canManageProducts()"
            ></mat-slide-toggle>
          </td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let product">
            <a mat-icon-button [routerLink]="['/dashboard/products', product._id]" color="primary" matTooltip="View Details">
              <mat-icon class="material-symbols-outlined">visibility</mat-icon>
            </a>
            <a mat-icon-button [routerLink]="['/dashboard/products/edit', product._id]" color="accent" *ngIf="canManageProducts()" matTooltip="Edit">
              <mat-icon class="material-symbols-outlined">edit</mat-icon>
            </a>
            <button mat-icon-button color="warn" (click)="confirmDelete(product)" *ngIf="canManageProducts()" matTooltip="Delete">
              <mat-icon class="material-symbols-outlined">delete</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        
        <tr class="mat-row" *matNoDataRow>
          <td class="mat-cell" [attr.colspan]="displayedColumns.length" style="text-align: center; padding: 16px;">
            No products found
          </td>
        </tr>
      </table>
    </div>
  `,
  styles: [`
    .product-container {
      width: 100%;
    }
    .header-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .filter-card {
      margin-bottom: 20px;
    }
    .filter-form {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      align-items: center;
    }
    .filter-field {
      flex: 1;
      min-width: 200px;
    }
    .price-range {
      display: flex;
      gap: 16px;
      flex: 2;
      min-width: 300px;
    }
    .filter-actions {
      display: flex;
      gap: 8px;
      margin-left: auto;
    }
    .product-table {
      width: 100%;
    }
    .product-image {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 4px;
    }
    .no-image {
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f5f5f5;
      border-radius: 4px;
    }
    @media (max-width: 767px) {
      .filter-form {
        flex-direction: column;
        align-items: stretch;
      }
      .filter-field, .price-range {
        min-width: 100%;
      }
      .price-range {
        flex-direction: column;
        gap: 0;
      }
      .filter-actions {
        margin-left: 0;
        justify-content: flex-end;
      }
    }
  `]
})
export class ProductListComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private tagService = inject(TagService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  products: Product[] = [];
  categories: any[] = [];
  tags: any[] = [];
  displayedColumns: string[] = ['image', 'name', 'price', 'category', 'tags', 'availability', 'actions'];
  isLoading = false;

  filterForm: FormGroup = this.fb.group({
    search: [''],
    category: [''],
    tag: [''],
    minPrice: [null],
    maxPrice: [null]
  });

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
    this.loadTags();
  }

  loadProducts(filters = {}): void {
    this.isLoading = true;
    this.productService.getProducts(filters).subscribe({
      next: (response:any) => {
        this.products = response.data.products;
        this.isLoading = false;
      },
      error: (error:any) => {
        console.error('Error loading products:', error);
        this.snackBar.open(error.error?.message || 'Failed to load products', 'Close', { duration: 5000 });
        this.isLoading = false;
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (response:any) => {
        this.categories = response.data.categories;
      },
      error: (error:any) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  loadTags(): void {
    this.tagService.getTags().subscribe({
      next: (response:any) => {
        this.tags = response.data.tags;
      },
      error: (error:any) => {
        console.error('Error loading tags:', error);
      }
    });
  }

  applyFilters(): void {
    const filters: { [key: string]: any } = {
      search: this.filterForm.value.search,
      category: this.filterForm.value.category,
      tag: this.filterForm.value.tag,
      minPrice: this.filterForm.value.minPrice,
      maxPrice: this.filterForm.value.maxPrice
    };
    
    // Remove undefined, null, or empty string values
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined || filters[key] === null || filters[key] === '') {
        delete filters[key];
      }
    });
    
    this.loadProducts(filters);
  }

  resetFilters(): void {
    this.filterForm.reset({
      search: '',
      category: '',
      tag: '',
      minPrice: null,
      maxPrice: null
    });
    this.loadProducts();
  }

  toggleAvailability(product: Product, isAvailable: boolean): void {
    this.productService.updateProduct(product._id, { isAvailable }).subscribe({
      next: () => {
        product.isAvailable = isAvailable;
        this.snackBar.open(`Product ${isAvailable ? 'enabled' : 'disabled'} successfully`, 'Close', { duration: 3000 });
      },
      error: (error:any) => {
        // Revert toggle if update fails
        product.isAvailable = !isAvailable;
        this.snackBar.open(error.error?.message || 'Failed to update product', 'Close', { duration: 5000 });
      }
    });
  }

  confirmDelete(product: Product): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Product',
        message: `Are you sure you want to delete "${product.name}"?`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.deleteProduct(product._id);
      }
    });
  }

  deleteProduct(id: string): void {
    this.productService.deleteProduct(id).subscribe({
      next: () => {
        this.snackBar.open('Product deleted successfully', 'Close', { duration: 3000 });
        this.loadProducts();
      },
      error: (error:any) => {
        this.snackBar.open(error.error?.message || 'Error deleting product', 'Close', { duration: 5000 });
      }
    });
  }

  canManageProducts(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.role === 'manager';
  }
}