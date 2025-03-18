// forgot-password.component.ts
import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from "@angular/forms";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-forgot-password',
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
      <h1>Forgot Password</h1>
      <p>Enter the email address associated with your account</p>
      
      <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="outline" class="form-field">
          <mat-label>Enter Your Email</mat-label>
          <input matInput formControlName="email" type="email">
        </mat-form-field>
        
        <button mat-flat-button class="reset-button" type="submit">Reset Password</button>
      </form>
    </div>
  `,
  styles: [`
    .auth-content {
      display: flex;
      flex-direction: column;
      text-align: left;
    }
    
    h1 {
      margin-bottom: 8px;
      color: #FF5252;
      font-weight: 500;
    }
    
    p {
      margin-top: 0;
      margin-bottom: 24px;
      font-size: 14px;
    }
    
    .form-field {
      width: 100%;
      margin-bottom: 24px;
    }
    
    .reset-button {
      width: 100%;
      background-color: #009c4c;
      color: white;
      padding: 12px;
      border-radius: 4px;
    }
  `]
})
export class ForgotPasswordComponent {
  forgotPasswordForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  });
  // Add to component
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  isLoading = false;

  onSubmit() {
    if (this.forgotPasswordForm.valid) {
      this.isLoading = true;
      this.authService.forgotPassword(this.forgotPasswordForm.value.email || '').subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/auth/check-email'], {
            state: { email: this.forgotPasswordForm.value.email }
          });
        },
        error: (error) => {
          this.isLoading = false;
          this.snackBar.open(error.error?.message || 'An error occurred', 'Close', { duration: 5000 });
        }
      });
    }
  }
}