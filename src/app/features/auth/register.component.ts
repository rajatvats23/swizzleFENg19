// register.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="auth-content">
      <h1>Complete Registration</h1>
      <h2>Enter your details to get started</h2>
      
      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="outline" class="form-field">
          <mat-label>First Name</mat-label>
          <input matInput formControlName="firstName" placeholder="Enter your first name">
          <mat-error *ngIf="registerForm.controls.firstName.hasError('required')">First name is required</mat-error>
        </mat-form-field>
        
        <mat-form-field appearance="outline" class="form-field">
          <mat-label>Last Name</mat-label>
          <input matInput formControlName="lastName" placeholder="Enter your last name">
          <mat-error *ngIf="registerForm.controls.lastName.hasError('required')">Last name is required</mat-error>
        </mat-form-field>
        
        <mat-form-field appearance="outline" class="form-field">
          <mat-label>Country Code</mat-label>
          <input matInput formControlName="countryCode" placeholder="+1">
          <mat-error *ngIf="registerForm.controls.countryCode.hasError('required')">Country code is required</mat-error>
        </mat-form-field>
        
        <mat-form-field appearance="outline" class="form-field">
          <mat-label>Phone Number</mat-label>
          <input matInput formControlName="phoneNumber" placeholder="Enter your phone number">
          <mat-error *ngIf="registerForm.controls.phoneNumber.hasError('required')">Phone number is required</mat-error>
        </mat-form-field>
        
        <mat-form-field appearance="outline" class="form-field">
          <mat-label>Password</mat-label>
          <input matInput formControlName="password" [type]="hidePassword ? 'password' : 'text'">
          <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword">
            <mat-icon class="material-symbols-outlined">{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
          <mat-error *ngIf="registerForm.controls.password.hasError('required')">Password is required</mat-error>
          <mat-error *ngIf="registerForm.controls.password.hasError('minlength')">Password must be at least 8 characters</mat-error>
        </mat-form-field>
        
        <button mat-flat-button class="register-button" type="submit" [disabled]="registerForm.invalid || isLoading">
          <span *ngIf="isLoading">Processing...</span>
          <span *ngIf="!isLoading">Complete Registration</span>
        </button>
      </form>
    </div>
  `,
  styles: [`
    .auth-content {
      font-family: 'Josephin', sans-serif !important;
      display: flex;
      flex-direction: column;
      text-align: left;
    }
    
    h1 {
      margin-bottom: 8px;
      font-weight: 500;
    }
    
    h2 {
      margin-top: 0;
      margin-bottom: 24px;
      font-weight: 400;
      font-size: 16px;
    }
    
    .form-field {
      width: 100%;
      margin-bottom: 12px;
    }
    
    .register-button {
      width: 100%;
      background-color: #009c4c;
      color: white;
      padding: 12px;
      margin-top: 12px;
      border-radius: 4px;
    }
  `]
})
export class RegisterComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  
  token = '';
  isLoading = false;
  hidePassword = true;
  
  registerForm = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    countryCode: new FormControl('', [Validators.required]),
    phoneNumber: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)])
  });
  
  ngOnInit(): void {
    this.token = this.route.snapshot.params['token'];
    if (!this.token) {
      this.router.navigate(['/auth/login']);
    }
  }
  
  onSubmit(): void {
    if (this.registerForm.valid && this.token) {
      this.isLoading = true;
      this.authService.registerAdmin(this.token, this.registerForm.value).subscribe({
        next: (response) => {
          this.snackBar.open('Registration successful', 'Close', { duration: 3000 });
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          this.snackBar.open(error.error?.message || 'Registration failed', 'Close', { duration: 5000 });
        }
      });
    }
  }
}