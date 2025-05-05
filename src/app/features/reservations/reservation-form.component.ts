// src/app/features/reservations/reservation-form.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReservationService } from './reservation.service';

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatIconModule
  ],
  template: `
    <div class="container">
      <div class="header-actions">
        <span class="top-label">{{ isEditMode ? 'Edit' : 'Create' }} Reservation</span>
        <button mat-button color="primary" routerLink="/reservations">
          <mat-icon class="material-symbols-outlined">arrow_back</mat-icon> Back to List
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <form [formGroup]="reservationForm" (ngSubmit)="onSubmit()">
            <div class="form-section">
              <h3>Customer Information</h3>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Customer Name</mat-label>
                <input matInput formControlName="customerName" placeholder="Enter customer name">
                <mat-error *ngIf="reservationForm.get('customerName')?.hasError('required')">
                  Customer name is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Phone Number</mat-label>
                <input matInput formControlName="phoneNumber" placeholder="Enter phone number">
                <mat-error *ngIf="reservationForm.get('phoneNumber')?.hasError('required')">
                  Phone number is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email (Optional)</mat-label>
                <input matInput formControlName="email" placeholder="Enter email address">
                <mat-error *ngIf="reservationForm.get('email')?.hasError('email')">
                  Please enter a valid email address
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-section">
              <h3>Reservation Details</h3>
              
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Date</mat-label>
                  <input matInput [matDatepicker]="picker" formControlName="reservationDate">
                  <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
                  <mat-datepicker #picker></mat-datepicker>
                  <mat-error *ngIf="reservationForm.get('reservationDate')?.hasError('required')">
                    Date is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Time</mat-label>
                  <input matInput type="time" formControlName="reservationTime">
                  <mat-error *ngIf="reservationForm.get('reservationTime')?.hasError('required')">
                    Time is required
                  </mat-error>
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Party Size</mat-label>
                <input matInput type="number" min="1" formControlName="partySize">
                <mat-error *ngIf="reservationForm.get('partySize')?.hasError('required')">
                  Party size is required
                </mat-error>
                <mat-error *ngIf="reservationForm.get('partySize')?.hasError('min')">
                  Party size must be at least 1
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width" *ngIf="isEditMode">
                <mat-label>Status</mat-label>
                <mat-select formControlName="status">
                  <mat-option value="pending">Pending</mat-option>
                  <mat-option value="confirmed">Confirmed</mat-option>
                  <mat-option value="seated">Seated</mat-option>
                  <mat-option value="completed">Completed</mat-option>
                  <mat-option value="cancelled">Cancelled</mat-option>
                  <mat-option value="no-show">No-show</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Special Requests (Optional)</mat-label>
                <textarea matInput formControlName="specialRequests" rows="3" placeholder="Enter any special requests or notes"></textarea>
              </mat-form-field>
            </div>

            <div class="form-actions">
              <button mat-button type="button" routerLink="/reservations">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="reservationForm.invalid || isSubmitting">
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
      max-width: 800px;
      margin: 0 auto;
    }
    .header-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .form-section {
      margin-bottom: 24px;
    }
    .form-section h3 {
      margin-bottom: 16px;
      color: #555;
    }
    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }
    .form-row > mat-form-field {
      flex: 1;
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
    @media (max-width: 599px) {
      .form-row {
        flex-direction: column;
        gap: 0;
      }
    }
  `]
})
export class ReservationFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private reservationService = inject(ReservationService);
  private snackBar = inject(MatSnackBar);

  reservationForm!: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  reservationId = '';

  ngOnInit(): void {
    this.initForm();
    
    this.reservationId = this.route.snapshot.params['id'];
    this.isEditMode = !!this.reservationId;
    
    if (this.isEditMode) {
      this.loadReservationData();
    }
  }

  initForm(): void {
    this.reservationForm = this.fb.group({
      customerName: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      email: ['', Validators.email],
      reservationDate: [new Date(), Validators.required],
      reservationTime: ['18:00', Validators.required],
      partySize: [2, [Validators.required, Validators.min(1)]],
      specialRequests: [''],
      status: ['pending']
    });
  }

  loadReservationData(): void {
    this.reservationService.getReservationById(this.reservationId).subscribe({
      next: (response) => {
        const reservation = response.data.reservation;
        const reservationDate = new Date(reservation.reservationDate);
        
        this.reservationForm.patchValue({
          customerName: reservation.customer.name,
          phoneNumber: reservation.customer.phoneNumber,
          email: reservation.customer.email || '',
          reservationDate: reservationDate,
          reservationTime: this.formatTimeForInput(reservationDate),
          partySize: reservation.partySize,
          specialRequests: reservation.specialRequests || '',
          status: reservation.status
        });
      },
      error: (error) => {
        this.snackBar.open(error.error?.message || 'Failed to load reservation', 'Close', { duration: 5000 });
        this.router.navigate(['/reservations']);
      }
    });
  }

  onSubmit(): void {
    if (this.reservationForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    const formData = this.reservationForm.value;
    
    // Combine date and time
    const reservationDate = new Date(formData.reservationDate);
    const [hours, minutes] = formData.reservationTime.split(':');
    reservationDate.setHours(parseInt(hours), parseInt(minutes));
    
    const reservationData = {
      customerName: formData.customerName,
      phoneNumber: formData.phoneNumber,
      email: formData.email || undefined,
      partySize: formData.partySize,
      reservationDate: reservationDate.toISOString(),
      specialRequests: formData.specialRequests || undefined,
      status: formData.status
    };

    if (this.isEditMode) {
      this.updateReservation(reservationData);
    } else {
      this.createReservation(reservationData);
    }
  }

  createReservation(data: any): void {
    this.reservationService.createReservation(data).subscribe({
      next: (response) => {
        this.snackBar.open('Reservation created successfully', 'Close', { duration: 3000 });
        this.router.navigate(['/reservations']);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.snackBar.open(error.error?.message || 'Failed to create reservation', 'Close', { duration: 5000 });
      }
    });
  }

  updateReservation(data: any): void {
    this.reservationService.updateReservation(this.reservationId, data).subscribe({
      next: (response) => {
        this.snackBar.open('Reservation updated successfully', 'Close', { duration: 3000 });
        this.router.navigate(['/reservations']);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.snackBar.open(error.error?.message || 'Failed to update reservation', 'Close', { duration: 5000 });
      }
    });
  }

  formatTimeForInput(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}