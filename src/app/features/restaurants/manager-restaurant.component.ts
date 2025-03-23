// src/app/features/restaurants/manager-restaurant.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { RestaurantService } from './restaurant.service';
import { Restaurant } from './models/restaurant.model';

@Component({
  selector: 'app-manager-restaurant',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDividerModule,
    MatTabsModule
  ],
  template: `
    <div class="container" *ngIf="restaurant">
      <div class="header-section">
        <h1>My Restaurant</h1>
        <div class="status-container">
          <mat-progress-bar [value]="restaurant.completionPercentage" [color]="getProgressColor(restaurant.completionPercentage)"></mat-progress-bar>
          <div class="status-info">
            <span>Profile Completion: {{restaurant.completionPercentage}}%</span>
            <mat-chip [color]="getStatusColor(restaurant.status)" selected>{{restaurant.status | titlecase}}</mat-chip>
          </div>
        </div>
      </div>

      <mat-card *ngIf="!restaurant.isBasicSetupComplete" class="alert-card">
        <mat-card-header>
          <mat-icon mat-card-avatar>warning</mat-icon>
          <mat-card-title>Complete Your Restaurant Setup</mat-card-title>
          <mat-card-subtitle>Please complete the basic information to make your restaurant visible</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p>Your restaurant profile is incomplete. Fill in all required fields to increase your completion percentage.</p>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-content>
          <mat-tab-group>
            <mat-tab label="Basic Information">
              <form [formGroup]="basicInfoForm" (ngSubmit)="onSubmitBasicInfo()" class="tab-content">
                <div class="form-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Restaurant Name</mat-label>
                    <input matInput formControlName="name" placeholder="Enter restaurant name">
                    <mat-error *ngIf="basicInfoForm.get('name')?.hasError('required')">Name is required</mat-error>
                  </mat-form-field>
                </div>

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

                <div class="form-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Description</mat-label>
                    <textarea matInput formControlName="description" rows="3" placeholder="Enter a description of your restaurant"></textarea>
                  </mat-form-field>
                </div>

                <div class="form-row two-col">
                  <mat-form-field appearance="outline">
                    <mat-label>Cuisine Type</mat-label>
                    <input matInput formControlName="cuisineType" placeholder="E.g., Italian, Indian, etc.">
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Website</mat-label>
                    <input matInput formControlName="website" placeholder="Enter website URL">
                  </mat-form-field>
                </div>

                <div class="form-actions">
                  <button mat-raised-button color="primary" type="submit" [disabled]="basicInfoForm.invalid || isSubmitting">
                    {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
                  </button>
                </div>
              </form>
            </mat-tab>

            <mat-tab label="Location">
              <form [formGroup]="locationForm" (ngSubmit)="onSubmitLocation()" class="tab-content">
                <div class="form-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Address</mat-label>
                    <input matInput formControlName="address" placeholder="Enter street address">
                    <mat-error *ngIf="locationForm.get('address')?.hasError('required')">Address is required</mat-error>
                  </mat-form-field>
                </div>

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

                <div class="form-actions">
                  <button mat-raised-button color="primary" type="submit" [disabled]="locationForm.invalid || isSubmitting">
                    {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
                  </button>
                </div>
              </form>
            </mat-tab>

            <mat-tab label="Operating Hours">
              <form [formGroup]="hoursForm" (ngSubmit)="onSubmitHours()" class="tab-content">
                <div class="hours-grid">
                  <div class="day-hours" formGroupName="monday">
                    <h3>Monday</h3>
                    <div class="hours-row">
                      <mat-form-field appearance="outline">
                        <mat-label>Open</mat-label>
                        <input matInput formControlName="open" placeholder="e.g., 9:00 AM">
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>Close</mat-label>
                        <input matInput formControlName="close" placeholder="e.g., 5:00 PM">
                      </mat-form-field>
                    </div>
                  </div>

                  <div class="day-hours" formGroupName="tuesday">
                    <h3>Tuesday</h3>
                    <div class="hours-row">
                      <mat-form-field appearance="outline">
                        <mat-label>Open</mat-label>
                        <input matInput formControlName="open" placeholder="e.g., 9:00 AM">
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>Close</mat-label>
                        <input matInput formControlName="close" placeholder="e.g., 5:00 PM">
                      </mat-form-field>
                    </div>
                  </div>

                  <div class="day-hours" formGroupName="wednesday">
                    <h3>Wednesday</h3>
                    <div class="hours-row">
                      <mat-form-field appearance="outline">
                        <mat-label>Open</mat-label>
                        <input matInput formControlName="open" placeholder="e.g., 9:00 AM">
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>Close</mat-label>
                        <input matInput formControlName="close" placeholder="e.g., 5:00 PM">
                      </mat-form-field>
                    </div>
                  </div>

                  <div class="day-hours" formGroupName="thursday">
                    <h3>Thursday</h3>
                    <div class="hours-row">
                      <mat-form-field appearance="outline">
                        <mat-label>Open</mat-label>
                        <input matInput formControlName="open" placeholder="e.g., 9:00 AM">
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>Close</mat-label>
                        <input matInput formControlName="close" placeholder="e.g., 5:00 PM">
                      </mat-form-field>
                    </div>
                  </div>

                  <div class="day-hours" formGroupName="friday">
                    <h3>Friday</h3>
                    <div class="hours-row">
                      <mat-form-field appearance="outline">
                        <mat-label>Open</mat-label>
                        <input matInput formControlName="open" placeholder="e.g., 9:00 AM">
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>Close</mat-label>
                        <input matInput formControlName="close" placeholder="e.g., 5:00 PM">
                      </mat-form-field>
                    </div>
                  </div>

                  <div class="day-hours" formGroupName="saturday">
                    <h3>Saturday</h3>
                    <div class="hours-row">
                      <mat-form-field appearance="outline">
                        <mat-label>Open</mat-label>
                        <input matInput formControlName="open" placeholder="e.g., 10:00 AM">
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>Close</mat-label>
                        <input matInput formControlName="close" placeholder="e.g., 3:00 PM">
                      </mat-form-field>
                    </div>
                  </div>

                  <div class="day-hours" formGroupName="sunday">
                    <h3>Sunday</h3>
                    <div class="hours-row">
                      <mat-form-field appearance="outline">
                        <mat-label>Open</mat-label>
                        <input matInput formControlName="open" placeholder="e.g., 10:00 AM">
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>Close</mat-label>
                        <input matInput formControlName="close" placeholder="e.g., 3:00 PM">
                      </mat-form-field>
                    </div>
                  </div>
                </div>

                <div class="form-actions">
                  <button mat-raised-button color="primary" type="submit" [disabled]="isSubmitting">
                    {{ isSubmitting ? 'Saving...' : 'Save Hours' }}
                  </button>
                </div>
              </form>
            </mat-tab>
          </mat-tab-group>
        </mat-card-content>
      </mat-card>
    </div>

    <div class="loading-container" *ngIf="isLoading">
      <p>Loading restaurant details...</p>
    </div>
  `,
  styles: [`
    .container {
      width: 100%;
    }
    .header-section {
      margin-bottom: 20px;
    }
    .status-container {
      background-color: white;
      border-radius: 4px;
      padding: 16px;
      margin-top: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .status-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 10px;
    }
    .alert-card {
      margin-bottom: 20px;
      background-color: #fff8e1;
    }
    .tab-content {
      padding: 20px 0;
    }
    .form-row {
      margin-bottom: 20px;
    }
    .two-col > * {
      display: flex;
      gap: 20px;
    }
    .full-width {
      width: 100%;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
    }
    .hours-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }
    .day-hours {
      margin-bottom: 20px;
    }
    .hours-row {
      display: flex;
      gap: 10px;
    }
    .hours-row mat-form-field {
      flex: 1;
    }
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 40px;
    }
    h3 {
      margin-top: 0;
      margin-bottom: 10px;
      font-size: 16px;
      font-weight: 500;
    }
    @media (max-width: 600px) {
      .two-col {
        flex-direction: column;
        gap: 0;
      }
      .hours-row {
        flex-direction: column;
        gap: 0;
      }
    }
  `]
})
export class ManagerRestaurantComponent implements OnInit {
  private fb = inject(FormBuilder);
  private restaurantService = inject(RestaurantService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  restaurant: Restaurant | null = null;
  isLoading = true;
  isSubmitting = false;

  basicInfoForm!: FormGroup;
  locationForm!: FormGroup;
  hoursForm!: FormGroup;

  ngOnInit(): void {
    this.initForms();
    this.loadRestaurant();
  }

  initForms(): void {
    this.basicInfoForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      description: [''],
      cuisineType: [''],
      website: ['']
    });

    this.locationForm = this.fb.group({
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: [''],
      zipCode: [''],
      country: ['', Validators.required]
    });

    this.hoursForm = this.fb.group({
      monday: this.fb.group({
        open: [''],
        close: ['']
      }),
      tuesday: this.fb.group({
        open: [''],
        close: ['']
      }),
      wednesday: this.fb.group({
        open: [''],
        close: ['']
      }),
      thursday: this.fb.group({
        open: [''],
        close: ['']
      }),
      friday: this.fb.group({
        open: [''],
        close: ['']
      }),
      saturday: this.fb.group({
        open: [''],
        close: ['']
      }),
      sunday: this.fb.group({
        open: [''],
        close: ['']
      })
    });
  }

  loadRestaurant(): void {
    this.isLoading = true;
    this.restaurantService.getManagerRestaurant().subscribe({
      next: (response) => {
        this.restaurant = response.data.restaurant;
        this.populateForms();
        this.isLoading = false;
      },
      error: (error) => {
        this.snackBar.open(error.error?.message || 'Failed to load restaurant', 'Close', { duration: 5000 });
        this.isLoading = false;
      }
    });
  }

  populateForms(): void {
    if (!this.restaurant) return;

    // Populate basic info form
    this.basicInfoForm.patchValue({
      name: this.restaurant.name,
      email: this.restaurant.email,
      phone: this.restaurant.phone,
      description: this.restaurant.description || '',
      cuisineType: this.restaurant.cuisineType || '',
      website: this.restaurant.website || ''
    });

    // Populate location form
    this.locationForm.patchValue({
      address: this.restaurant.address,
      city: this.restaurant.city,
      state: this.restaurant.state || '',
      zipCode: this.restaurant.zipCode || '',
      country: this.restaurant.country
    });

    // Populate hours form if available
    if (this.restaurant.operatingHours) {
      this.hoursForm.patchValue({
        monday: this.restaurant.operatingHours.monday || { open: '', close: '' },
        tuesday: this.restaurant.operatingHours.tuesday || { open: '', close: '' },
        wednesday: this.restaurant.operatingHours.wednesday || { open: '', close: '' },
        thursday: this.restaurant.operatingHours.thursday || { open: '', close: '' },
        friday: this.restaurant.operatingHours.friday || { open: '', close: '' },
        saturday: this.restaurant.operatingHours.saturday || { open: '', close: '' },
        sunday: this.restaurant.operatingHours.sunday || { open: '', close: '' }
      });
    }
  }

  onSubmitBasicInfo(): void {
    if (this.basicInfoForm.invalid || !this.restaurant) {
      return;
    }

    this.isSubmitting = true;
    const formData = this.basicInfoForm.value;

    this.restaurantService.updateRestaurant(this.restaurant._id, formData).subscribe({
      next: (response) => {
        this.restaurant = response.data.restaurant;
        this.snackBar.open('Restaurant information updated successfully', 'Close', { duration: 3000 });
        this.isSubmitting = false;
      },
      error: (error) => {
        this.snackBar.open(error.error?.message || 'Failed to update restaurant', 'Close', { duration: 5000 });
        this.isSubmitting = false;
      }
    });
  }

  onSubmitLocation(): void {
    if (this.locationForm.invalid || !this.restaurant) {
      return;
    }

    this.isSubmitting = true;
    const formData = this.locationForm.value;

    this.restaurantService.updateRestaurant(this.restaurant._id, formData).subscribe({
      next: (response) => {
        this.restaurant = response.data.restaurant;
        this.snackBar.open('Location information updated successfully', 'Close', { duration: 3000 });
        this.isSubmitting = false;
      },
      error: (error) => {
        this.snackBar.open(error.error?.message || 'Failed to update location', 'Close', { duration: 5000 });
        this.isSubmitting = false;
      }
    });
  }

  onSubmitHours(): void {
    if (!this.restaurant) {
      return;
    }

    this.isSubmitting = true;
    const operatingHours = this.hoursForm.value;

    this.restaurantService.updateRestaurant(this.restaurant._id, { operatingHours }).subscribe({
      next: (response) => {
        this.restaurant = response.data.restaurant;
        this.snackBar.open('Operating hours updated successfully', 'Close', { duration: 3000 });
        this.isSubmitting = false;
      },
      error: (error) => {
        this.snackBar.open(error.error?.message || 'Failed to update operating hours', 'Close', { duration: 5000 });
        this.isSubmitting = false;
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'primary';
      case 'inactive': return 'warn';
      default: return 'accent';
    }
  }

  getProgressColor(percentage: number): string {
    if (percentage < 30) return 'warn';
    if (percentage < 70) return 'accent';
    return 'primary';
  }
}