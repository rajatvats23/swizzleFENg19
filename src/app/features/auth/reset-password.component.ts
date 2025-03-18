// reset-password.component.ts
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <div class="auth-content">
      <h1>Set New Password</h1>
      <p>Type Your New Password here</p>

      <form [formGroup]="resetPasswordForm" (ngSubmit)="onSubmit()">
      <mat-form-field appearance="outline" class="form-field">
  <mat-label>New Password</mat-label>
  <input matInput formControlName="password" [type]="hidePassword ? 'password' : 'text'">
  <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword">
    <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
  </button>
  <mat-error *ngIf="resetPasswordForm.controls.password.hasError('required')">Password is required</mat-error>
  <mat-error *ngIf="resetPasswordForm.controls.password.hasError('minlength')">Password must be at least 8 characters</mat-error>
</mat-form-field>

        <mat-form-field appearance="outline" class="form-field">
          <mat-label>Confirm Password</mat-label>
          <input
            matInput
            formControlName="confirmPassword"
            [type]="hideConfirmPassword ? 'password' : 'text'"
          />
          <button
            mat-icon-button
            matSuffix
            type="button"
            (click)="hideConfirmPassword = !hideConfirmPassword"
          >
            <mat-icon>{{
              hideConfirmPassword ? 'visibility_off' : 'visibility'
            }}</mat-icon>
          </button>
          <mat-error *ngIf="passwordMatchError()">Passwords do not match</mat-error>
        </mat-form-field>

        <button
          mat-flat-button
          class="reset-button"
          type="submit"
          [disabled]="resetPasswordForm.invalid || isLoading"
        >
          {{ isLoading ? 'Processing...' : 'Reset Password' }}
        </button>
      </form>
    </div>
  `,
  styles: [
    `
      .auth-content {
        display: flex;
        flex-direction: column;
        text-align: left;
      }

      h1 {
        margin-bottom: 8px;
        font-weight: 500;
      }

      p {
        margin-top: 0;
        margin-bottom: 24px;
        font-size: 14px;
      }

      .form-field {
        width: 100%;
        margin-bottom: 16px;
      }

      .reset-button {
        width: 100%;
        background-color: #009c4c;
        color: white;
        padding: 12px;
        border-radius: 4px;
      }
    `,
  ],
})
export class ResetPasswordComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  token = '';
  isLoading = false;

  resetPasswordForm = new FormGroup({
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
    ]),
    confirmPassword: new FormControl('', [Validators.required]),
  });

  hidePassword = true;
  hideConfirmPassword = true;

  ngOnInit(): void {
    this.token = this.route.snapshot.params['token'];
    if (!this.token) {
      this.router.navigate(['/auth/login']);
    }
  }

  onSubmit() {
    if (this.resetPasswordForm.valid) {
      const password = this.resetPasswordForm.value.password || '';
      const confirmPassword =
        this.resetPasswordForm.value.confirmPassword || '';

      if (password !== confirmPassword) {
        this.snackBar.open('Passwords do not match', 'Close', {
          duration: 3000,
        });
        return;
      }

      this.isLoading = true;
      this.authService.resetPassword(this.token, password).subscribe({
        next: () => {
          this.snackBar.open('Password reset successful', 'Close', {
            duration: 3000,
          });
          this.router.navigate(['/auth/login']);
        },
        error: (error) => {
          this.isLoading = false;
          this.snackBar.open(
            error.error?.message || 'Password reset failed',
            'Close',
            { duration: 5000 }
          );
        },
      });
    }
  }

  // Add this to your component class
passwordMatchError() {
  const password = this.resetPasswordForm.get('password')?.value;
  const confirmPassword = this.resetPasswordForm.get('confirmPassword')?.value;
  return password !== confirmPassword && this.resetPasswordForm.get('confirmPassword')?.touched;
}
}
