// src/app/features/categories/category-form.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CategoryService } from './category.service';
import { MenuService } from '../menus/menu.service';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCardModule,
    MatIconModule
  ],
  template: `
    <div class="container">
      <div class="header-actions">
        <span class="top-label">{{ isEditMode ? 'Edit' : 'Create' }} Category</span>
        <button mat-button color="primary" routerLink="/dashboard/categories">
          <mat-icon class="material-symbols-outlined">arrow_back</mat-icon> Back to List
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <form [formGroup]="categoryForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Category Name</mat-label>
              <input matInput formControlName="name" placeholder="Enter category name">
              <mat-error *ngIf="categoryForm.get('name')?.hasError('required')">Name is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" placeholder="Enter category description" rows="3"></textarea>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Order</mat-label>
              <input matInput formControlName="order" type="number" placeholder="Enter display order">
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Menus</mat-label>
              <mat-select formControlName="menus" multiple>
                <mat-option *ngFor="let menu of menus" [value]="menu._id">{{menu.name}}</mat-option>
              </mat-select>
            </mat-form-field>

            <div class="form-actions">
              <button mat-button type="button" routerLink="/dashboard/categories">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="categoryForm.invalid || isSubmitting">
                {{ isSubmitting ? 'Saving...' : (isEditMode ? 'Update' : 'Create') }}
              </button>
            </div>
          </form>
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
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    .form-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-top: 20px;
    }
  `]
})
export class CategoryFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private categoryService = inject(CategoryService);
  private menuService = inject(MenuService);
  private snackBar = inject(MatSnackBar);

  categoryForm!: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  categoryId = '';
  menus: any[] = [];

  ngOnInit(): void {
    this.initForm();
    this.loadMenus();
    
    this.categoryId = this.route.snapshot.params['id'];
    this.isEditMode = !!this.categoryId;
    
    if (this.isEditMode) {
      this.loadCategoryData();
    }
  }

  initForm(): void {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      order: [0],
      menus: [[]]
    });
  }

  loadMenus(): void {
    this.menuService.getMenus().subscribe({
      next: (response) => {
        this.menus = response.data.menus;
      },
      error: (error) => {
        this.snackBar.open(error.error?.message || 'Failed to load menus', 'Close', { duration: 5000 });
      }
    });
  }

  loadCategoryData(): void {
    this.categoryService.getCategoryById(this.categoryId).subscribe({
      next: (response) => {
        const category = response.data.category;
        
        // Extract menu IDs from the populated menus array
        const menuIds = category.menus.map((menu: any) => 
          typeof menu === 'string' ? menu : menu._id
        );
        
        this.categoryForm.patchValue({
          name: category.name,
          description: category.description || '',
          order: category.order,
          menus: menuIds
        });
      },
      error: (error) => {
        this.snackBar.open(error.error?.message || 'Failed to load category', 'Close', { duration: 5000 });
        this.router.navigate(['/dashboard/categories']);
      }
    });
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    const formData = this.categoryForm.value;

    if (this.isEditMode) {
      this.categoryService.updateCategory(this.categoryId, formData).subscribe({
        next: () => {
          this.snackBar.open('Category updated successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/dashboard/categories']);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.snackBar.open(error.error?.message || 'Failed to update category', 'Close', { duration: 5000 });
        }
      });
    } else {
      this.categoryService.createCategory(formData).subscribe({
        next: () => {
          this.snackBar.open('Category created successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/dashboard/categories']);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.snackBar.open(error.error?.message || 'Failed to create category', 'Close', { duration: 5000 });
        }
      });
    }
  }
}