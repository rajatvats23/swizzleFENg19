import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
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
        MatButtonModule
    ],
    template: `
    <div class="auth-content">
      <h1>Complete Registration</h1>
      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="outline" class="form-field">
          <mat-label>First Name</mat-label>
          <input matInput formControlName="firstName">
        </mat-form-field>
        
        <mat-form-field appearance="outline" class="form-field">
          <mat-label>Last Name</mat-label>
          <input matInput formControlName="lastName">
        </mat-form-field>
        
        <mat-form-field appearance="outline" class="form-field">
          <mat-label>Country Code</mat-label>
          <input matInput formControlName="countryCode" placeholder="+1">
        </mat-form-field>
        
        <mat-form-field appearance="outline" class="form-field">
          <mat-label>Phone Number</mat-label>
          <input matInput formControlName="phoneNumber">
        </mat-form-field>
        
        <mat-form-field appearance="outline" class="form-field">
          <mat-label>Password</mat-label>
          <input matInput formControlName="password" type="password">
        </mat-form-field>
        
        <button mat-flat-button color="primary" type="submit" [disabled]="registerForm.invalid || isLoading">
          {{ isLoading ? 'Processing...' : 'Complete Registration' }}
        </button>
      </form>
    </div>
  `,
    styles: [`
    .auth-content {
      display: flex;
      flex-direction: column;
    }
    .form-field {
      width: 100%;
      margin-bottom: 16px;
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