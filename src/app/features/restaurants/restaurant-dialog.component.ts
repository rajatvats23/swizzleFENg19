// src/app/features/restaurants/restaurant-dialog/restaurant-dialog.component.ts
import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Restaurant, RestaurantCreateDto, RestaurantUpdateDto } from './models/restaurant.model';
import { RestaurantService } from './restaurant.service';

export interface RestaurantDialogData {
  restaurant?: Restaurant;
  isEditMode?: boolean;
}

@Component({
  selector: 'app-restaurant-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule
  ],
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title>{{ isEditMode ? 'Edit Restaurant' : 'Add New Restaurant' }}</h2>
      
      <mat-dialog-content>
        <mat-stepper [linear]="true" #stepper>
          <!-- Basic Information Step -->
          <mat-step [stepControl]="basicInfoForm">
            <ng-template matStepLabel>Basic Information</ng-template>
            <form [formGroup]="basicInfoForm" *ngIf="basicInfoForm">
              <div class="form-step-content">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Restaurant Name</mat-label>
                  <input matInput formControlName="name" placeholder="Enter restaurant name">
                  <mat-error *ngIf="basicInfoForm.get('name')?.hasError('required')">Name is required</mat-error>
                </mat-form-field>

                <div class="form-row two-col">
                  <mat-form-field appearance="outline">
                    <mat-label>Email</mat-label>
                    <input matInput formControlName="email" type="email" placeholder="Enter email">
                    <mat-error *ngIf="basicInfoForm.get('email')?.hasError('required')">Email is required</mat-error>
                    <mat-error *ngIf="basicInfoForm.get('email')?.hasError('email')">Enter a valid email</mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Phone</mat-label>
                    <input matInput formControlName="phone" placeholder="Enter phone number">
                    <mat-error *ngIf="basicInfoForm.get('phone')?.hasError('required')">Phone is required</mat-error>
                  </mat-form-field>
                </div>

                <mat-form-field appearance="outline" class="full-width" *ngIf="!isEditMode && basicInfoForm.get('managerEmail')">
                  <mat-label>Manager Email</mat-label>
                  <input matInput formControlName="managerEmail" type="email" placeholder="Enter manager's email">
                  <mat-hint>An invitation will be sent to this email</mat-hint>
                  <mat-error *ngIf="basicInfoForm.get('managerEmail')?.hasError('required')">Manager email is required</mat-error>
                  <mat-error *ngIf="basicInfoForm.get('managerEmail')?.hasError('email')">Enter a valid email</mat-error>
                </mat-form-field>

                <div class="step-actions">
                  <button mat-button matStepperNext color="primary" [disabled]="basicInfoForm.invalid">Next</button>
                </div>
              </div>
            </form>
          </mat-step>

          <!-- Location Step -->
          <mat-step [stepControl]="locationForm">
            <ng-template matStepLabel>Location</ng-template>
            <form [formGroup]="locationForm" *ngIf="locationForm">
              <div class="form-step-content">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Address</mat-label>
                  <input matInput formControlName="address" placeholder="Enter street address">
                  <mat-error *ngIf="locationForm.get('address')?.hasError('required')">Address is required</mat-error>
                </mat-form-field>

                <div class="form-row two-col">
                  <mat-form-field appearance="outline">
                    <mat-label>City</mat-label>
                    <input matInput formControlName="city" placeholder="Enter city">
                    <mat-error *ngIf="locationForm.get('city')?.hasError('required')">City is required</mat-error>
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
                    <mat-error *ngIf="locationForm.get('country')?.hasError('required')">Country is required</mat-error>
                  </mat-form-field>
                </div>

                <div class="step-actions">
                  <button mat-button matStepperPrevious>Back</button>
                  <button mat-button matStepperNext color="primary" [disabled]="locationForm.invalid">Next</button>
                </div>
              </div>
            </form>
          </mat-step>

          <!-- Additional Details Step -->
          <mat-step [stepControl]="detailsForm">
            <ng-template matStepLabel>Additional Details</ng-template>
            <form [formGroup]="detailsForm" *ngIf="detailsForm">
              <div class="form-step-content">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Description</mat-label>
                  <textarea matInput formControlName="description" rows="3" placeholder="Enter restaurant description"></textarea>
                </mat-form-field>

                <div class="form-row two-col">
                  <mat-form-field appearance="outline">
                    <mat-label>Cuisine Type</mat-label>
                    <input matInput formControlName="cuisineType" placeholder="E.g., Italian, Indian, etc.">
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Status</mat-label>
                    <mat-select formControlName="status">
                      <mat-option value="draft">Draft</mat-option>
                      <mat-option value="active">Active</mat-option>
                      <mat-option value="inactive">Inactive</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Website</mat-label>
                  <input matInput formControlName="website" placeholder="Enter website URL">
                </mat-form-field>

                <div class="step-actions">
                  <button mat-button matStepperPrevious>Back</button>
                  <button mat-button matStepperNext color="primary">Next</button>
                </div>
              </div>
            </form>
          </mat-step>

          <!-- Review Step -->
          <mat-step>
            <ng-template matStepLabel>Review & Submit</ng-template>
            <div class="form-step-content" *ngIf="basicInfoForm && locationForm && detailsForm">
              <div class="review-section">
                <h3>Basic Information</h3>
                <p><strong>Name:</strong> {{ basicInfoForm.get('name')?.value }}</p>
                <p><strong>Email:</strong> {{ basicInfoForm.get('email')?.value }}</p>
                <p><strong>Phone:</strong> {{ basicInfoForm.get('phone')?.value }}</p>
                <p *ngIf="!isEditMode && basicInfoForm.get('managerEmail')"><strong>Manager Email:</strong> {{ basicInfoForm.get('managerEmail')?.value }}</p>
              </div>

              <div class="review-section">
                <h3>Location</h3>
                <p><strong>Address:</strong> {{ locationForm.get('address')?.value }}</p>
                <p><strong>City:</strong> {{ locationForm.get('city')?.value }}</p>
                <p *ngIf="locationForm.get('state')?.value"><strong>State/Province:</strong> {{ locationForm.get('state')?.value }}</p>
                <p *ngIf="locationForm.get('zipCode')?.value"><strong>Postal Code:</strong> {{ locationForm.get('zipCode')?.value }}</p>
                <p><strong>Country:</strong> {{ locationForm.get('country')?.value }}</p>
              </div>

              <div class="review-section" *ngIf="hasAdditionalDetails()">
                <h3>Additional Details</h3>
                <p *ngIf="detailsForm.get('description')?.value"><strong>Description:</strong> {{ detailsForm.get('description')?.value }}</p>
                <p *ngIf="detailsForm.get('cuisineType')?.value"><strong>Cuisine Type:</strong> {{ detailsForm.get('cuisineType')?.value }}</p>
                <p *ngIf="detailsForm.get('website')?.value"><strong>Website:</strong> {{ detailsForm.get('website')?.value }}</p>
                <p><strong>Status:</strong> {{ detailsForm.get('status')?.value }}</p>
              </div>

              <div class="step-actions">
                <button mat-button matStepperPrevious>Back</button>
                <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="isSubmitting">
                  {{ isSubmitting ? 'Saving...' : (isEditMode ? 'Update Restaurant' : 'Create Restaurant') }}
                </button>
              </div>
            </div>
          </mat-step>
        </mat-stepper>
      </mat-dialog-content>
      
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Cancel</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
  ::ng-deep .mat-horizontal-stepper-content,
::ng-deep .mat-vertical-stepper-content,
::ng-deep .mat-step-header {
  background-color: inherit !important;
}

::ng-deep .mat-step-header {
  background-color: transparent !important;
}

.dialog-container {
  background-color: #FFF8EB; /* This is your light brown/orange color */
}

.mat-mdc-dialog-surface {
  background-color: #FFF8EB !important;
}
    .dialog-container {
    //   min-width: 600px;
    //   max-width: 800px;
    }
    .form-step-content {
      margin-top: 16px;
      margin-bottom: 16px;
      min-height: 300px;
      display: flex;
      flex-direction: column;
    }
    .form-row {
      margin-bottom: 16px;
    }
    .two-col {
      display: flex;
      gap: 16px;
    }
    .full-width {
      width: 100%;
    }
    .step-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 16px;
    }
    .review-section {
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid #e0e0e0;
    }
    .review-section h3 {
      margin-bottom: 10px;
      color: #424242;
      font-weight: 500;
    }
    .review-section p {
      margin: 5px 0;
    }
    @media (max-width: 600px) {
      .dialog-container {
        min-width: auto;
      }
      .two-col {
        flex-direction: column;
        gap: 0;
      }
    }
  `]
})
export class RestaurantDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<RestaurantDialogComponent>);
  private restaurantService = inject(RestaurantService);
  private snackBar = inject(MatSnackBar);
  
  // Fix the data injection - Make it nullable with a default empty object
  data: RestaurantDialogData = inject(MAT_DIALOG_DATA) || { isEditMode: false };
  
  // Initialize the forms immediately to avoid template errors
  basicInfoForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required]
  });
  
  locationForm: FormGroup = this.fb.group({
    address: ['', Validators.required],
    city: ['', Validators.required],
    state: [''],
    zipCode: [''],
    country: ['', Validators.required]
  });
  
  detailsForm: FormGroup = this.fb.group({
    description: [''],
    cuisineType: [''],
    website: [''],
    status: ['draft', Validators.required]
  });
  
  isEditMode = false;
  isSubmitting = false;
  
  ngOnInit(): void {
    // Default to false if data is undefined
    this.isEditMode = this.data?.isEditMode || false;
    
    // Initialize forms before trying to patch them
    this.initForms();
    
    // Check if we have restaurant data to patch
    if (this.isEditMode && this.data?.restaurant) {
      this.patchForms(this.data.restaurant);
    }
  }
  
  initForms(): void {
    // Make sure this is called before the template tries to access the forms
    
    // Basic Info Form
    const basicInfoControls: any = {
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required]
    };
    
    // Only add managerEmail field for create mode
    if (!this.isEditMode) {
      basicInfoControls.managerEmail = ['', [Validators.required, Validators.email]];
    }
    
    this.basicInfoForm = this.fb.group(basicInfoControls);
    
    // Location Form
    this.locationForm = this.fb.group({
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: [''],
      zipCode: [''],
      country: ['', Validators.required]
    });
    
    // Additional Details Form
    this.detailsForm = this.fb.group({
      description: [''],
      cuisineType: [''],
      website: [''],
      status: ['draft', Validators.required]
    });
  }
  
  patchForms(restaurant: Restaurant): void {
    // Patch Basic Info
    this.basicInfoForm.patchValue({
      name: restaurant.name,
      email: restaurant.email,
      phone: restaurant.phone
    });
    
    // Patch Location
    this.locationForm.patchValue({
      address: restaurant.address,
      city: restaurant.city,
      state: restaurant.state || '',
      zipCode: restaurant.zipCode || '',
      country: restaurant.country
    });
    
    // Patch Details
    this.detailsForm.patchValue({
      description: restaurant.description || '',
      cuisineType: restaurant.cuisineType || '',
      website: restaurant.website || '',
      status: restaurant.status
    });
  }
  
  hasAdditionalDetails(): boolean {
    return !!(
      this.detailsForm.get('description')?.value ||
      this.detailsForm.get('cuisineType')?.value ||
      this.detailsForm.get('website')?.value
    );
  }
  
  onSubmit(): void {
    if (this.basicInfoForm.invalid || this.locationForm.invalid) {
      return;
    }
    
    this.isSubmitting = true;
    
    // Combine all form values
    const formData = {
      ...this.basicInfoForm.value,
      ...this.locationForm.value,
      ...this.detailsForm.value
    };
    
    if (this.isEditMode) {
      this.updateRestaurant(formData);
    } else {
      this.createRestaurant(formData);
    }
  }
  
  createRestaurant(data: RestaurantCreateDto): void {
    this.restaurantService.createRestaurant(data).subscribe({
      next: (response : any) => {
        this.snackBar.open('Restaurant created successfully', 'Close', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (error:any) => {
        this.isSubmitting = false;
        this.snackBar.open(error.error?.message || 'Failed to create restaurant', 'Close', { duration: 5000 });
      }
    });
  }
  
  updateRestaurant(data: RestaurantUpdateDto): void {
    if (!this.data.restaurant?._id) return;
    
    this.restaurantService.updateRestaurant(this.data.restaurant._id, data).subscribe({
      next: (response : any) => {
        this.snackBar.open('Restaurant updated successfully', 'Close', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (error:any) => {
        this.isSubmitting = false;
        this.snackBar.open(error.error?.message || 'Failed to update restaurant', 'Close', { duration: 5000 });
      }
    });
  }
}