// src/app/features/restaurants/restaurant-form.component.ts
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
import { MatDividerModule } from '@angular/material/divider';
import { RestaurantService } from './restaurant.service';

@Component({
  selector: 'app-restaurant-form',
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
    MatIconModule,
    MatDividerModule
  ],
  template: `
    <div class="container">
      <div class="header-actions">
        <span class="top-label">{{ isEditMode ? 'Edit' : 'Create' }} Restaurant</span>
        <button mat-button color="primary" routerLink="/dashboard/restaurants">
          <mat-icon class="material-symbols-outlined">arrow_back</mat-icon> Back to List
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <form [formGroup]="restaurantForm" (ngSubmit)="onSubmit()">
            <h2>Basic Information</h2>
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Restaurant Name</mat-label>
                <input matInput formControlName="name" placeholder="Enter restaurant name">
                <mat-error *ngIf="restaurantForm.get('name')?.hasError('required')">Name is required</mat-error>
              </mat-form-field>
            </div>

            <div class="form-row two-col">
              <mat-form-field appearance="outline">
                <mat-label>Email</mat-label>
                <input matInput formControlName="email" type="email" placeholder="Enter email">
                <mat-error *ngIf="restaurantForm.get('email')?.hasError('required')">Email is required</mat-error>
                <mat-error *ngIf="restaurantForm.get('email')?.hasError('email')">Enter a valid email</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Phone</mat-label>
                <input matInput formControlName="phone" placeholder="Enter phone number">
                <mat-error *ngIf="restaurantForm.get('phone')?.hasError('required')">Phone is required</mat-error>
              </mat-form-field>
            </div>

            <div class="form-row" *ngIf="!isEditMode">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Manager Email</mat-label>
                <input matInput formControlName="managerEmail" type="email" placeholder="Enter manager's email">
                <mat-hint>An invitation will be sent to this email</mat-hint>
                <mat-error *ngIf="restaurantForm.get('managerEmail')?.hasError('required')">Manager email is required</mat-error>
                <mat-error *ngIf="restaurantForm.get('managerEmail')?.hasError('email')">Enter a valid email</mat-error>
              </mat-form-field>
            </div>

            <mat-divider class="section-divider"></mat-divider>
            <h2>Location</h2>
            
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Address</mat-label>
                <input matInput formControlName="address" placeholder="Enter street address">
                <mat-error *ngIf="restaurantForm.get('address')?.hasError('required')">Address is required</mat-error>
              </mat-form-field>
            </div>

            <div class="form-row two-col">
              <mat-form-field appearance="outline">
                <mat-label>City</mat-label>
                <input matInput formControlName="city" placeholder="Enter city">
                <mat-error *ngIf="restaurantForm.get('city')?.hasError('required')">City is required</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>State/Province</mat-label>
                <input matInput formControlName="state" placeholder="Enter state or province">
              </mat-form-field>
            </div>

            <div class="form-row two-col">
              <mat-form-field appearance="outline">
                <mat-label>Postal Code</mat-label>
                <input matInput formControlName="zipCode" placeholder="Enter postal code">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Country</mat-label>
                <input matInput formControlName="country" placeholder="Enter country">
                <mat-error *ngIf="restaurantForm.get('country')?.hasError('required')">Country is required</mat-error>
              </mat-form-field>
            </div>

            <mat-divider class="section-divider"></mat-divider>
            <h2>Status</h2>
            
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Status</mat-label>
                <mat-select formControlName="status">
                  <mat-option value="draft">Draft</mat-option>
                  <mat-option value="active">Active</mat-option>
                  <mat-option value="inactive">Inactive</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <div class="form-actions">
              <button mat-button type="button" routerLink="/dashboard/restaurants">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="restaurantForm.invalid || isSubmitting">
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
    .form-row {
      margin-bottom: 20px;
    }
    .two-col {
      display: flex;
      gap: 20px;
    }
    .full-width {
      width: 100%;
    }
    .form-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-top: 20px;
    }
    .section-divider {
      margin: 20px 0;
    }
    h2 {
      margin-top: 0;
      font-size: 18px;
      font-weight: 500;
    }
    @media (max-width: 600px) {
      .two-col {
        flex-direction: column;
        gap: 0;
      }
    }
  `]
})
export class RestaurantFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private restaurantService = inject(RestaurantService);
  private snackBar = inject(MatSnackBar);

  restaurantForm!: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  restaurantId = '';

  ngOnInit(): void {
    this.initForm();
    
    this.restaurantId = this.route.snapshot.params['id'];
    this.isEditMode = !!this.restaurantId;
    
    if (this.isEditMode) {
      this.loadRestaurantData();
    }
  }

  initForm(): void {
    this.restaurantForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      managerEmail: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: [''],
      zipCode: [''],
      country: ['', Validators.required],
      status: ['draft', Validators.required]
    });

    // If in edit mode, remove managerEmail validation as it cannot be changed
    if (this.isEditMode) {
      this.restaurantForm.removeControl('managerEmail');
    }
  }

  loadRestaurantData(): void {
    this.restaurantService.getRestaurantById(this.restaurantId).subscribe({
      next: (response) => {
        const restaurant = response.data.restaurant;
        
        this.restaurantForm.patchValue({
          name: restaurant.name,
          email: restaurant.email,
          phone: restaurant.phone,
          address: restaurant.address,
          city: restaurant.city,
          state: restaurant.state || '',
          zipCode: restaurant.zipCode || '',
          country: restaurant.country,
          status: restaurant.status
        });
      },
      error: (error) => {
        this.snackBar.open(error.error?.message || 'Failed to load restaurant', 'Close', { duration: 5000 });
        this.router.navigate(['/dashboard/restaurants']);
      }
    });
  }

  onSubmit(): void {
    if (this.restaurantForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    const formData = this.restaurantForm.value;

    if (this.isEditMode) {
      this.restaurantService.updateRestaurant(this.restaurantId, formData).subscribe({
        next: () => {
          this.snackBar.open('Restaurant updated successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/dashboard/restaurants']);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.snackBar.open(error.error?.message || 'Failed to update restaurant', 'Close', { duration: 5000 });
        }
      });
    } else {
      this.restaurantService.createRestaurant(formData).subscribe({
        next: () => {
          this.snackBar.open('Restaurant created successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/dashboard/restaurants']);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.snackBar.open(error.error?.message || 'Failed to create restaurant', 'Close', { duration: 5000 });
        }
      });
    }
  }
}