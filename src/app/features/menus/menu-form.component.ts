// src/app/features/menus/menu-form.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MenuService } from './menu.service';

@Component({
  selector: 'app-menu-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  template: `
    <div class="container">
      <div class="header-actions">
        <span class="top-label">{{ isEditMode ? 'Edit' : 'Create' }} Menu</span>
        <button mat-button color="primary" routerLink="/dashboard/menus">
          <mat-icon class="material-symbols-outlined">arrow_back</mat-icon> Back to List
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <form [formGroup]="menuForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Menu Name</mat-label>
              <input matInput formControlName="name" placeholder="Enter menu name">
              <mat-error *ngIf="menuForm.get('name')?.hasError('required')">Name is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" placeholder="Enter menu description" rows="4"></textarea>
            </mat-form-field>

            <div class="form-actions">
              <button mat-button type="button" routerLink="/dashboard/menus">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="menuForm.invalid || isSubmitting">
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
export class MenuFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private menuService = inject(MenuService);
  private snackBar = inject(MatSnackBar);

  menuForm!: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  menuId = '';

  ngOnInit(): void {
    this.initForm();
    
    this.menuId = this.route.snapshot.params['id'];
    this.isEditMode = !!this.menuId;
    
    if (this.isEditMode) {
      this.loadMenuData();
    }
  }

  initForm(): void {
    this.menuForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });
  }

  loadMenuData(): void {
    this.menuService.getMenuById(this.menuId).subscribe({
      next: (response) => {
        const menu = response.data.menu;
        
        this.menuForm.patchValue({
          name: menu.name,
          description: menu.description || ''
        });
      },
      error: (error) => {
        this.snackBar.open(error.error?.message || 'Failed to load menu', 'Close', { duration: 5000 });
        this.router.navigate(['/dashboard/menus']);
      }
    });
  }

  onSubmit(): void {
    if (this.menuForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    const formData = this.menuForm.value;

    if (this.isEditMode) {
      this.menuService.updateMenu(this.menuId, formData).subscribe({
        next: () => {
          this.snackBar.open('Menu updated successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/dashboard/menus']);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.snackBar.open(error.error?.message || 'Failed to update menu', 'Close', { duration: 5000 });
        }
      });
    } else {
      this.menuService.createMenu(formData).subscribe({
        next: () => {
          this.snackBar.open('Menu created successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/dashboard/menus']);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.snackBar.open(error.error?.message || 'Failed to create menu', 'Close', { duration: 5000 });
        }
      });
    }
  }
}