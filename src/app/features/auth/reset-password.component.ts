// reset-password.component.ts
import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from "@angular/forms";
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
    MatIconModule
  ],
  template: `
    <div class="auth-content">
      <h1>Set New Password</h1>
      <p>Type Your New Password here</p>
      
      <form [formGroup]="resetPasswordForm" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="outline" class="form-field">
          <mat-label>New Password</mat-label>
          <input matInput formControlName="password" [type]="hidePassword ? 'password' : 'text'">
        </mat-form-field>
        
        <mat-form-field appearance="outline" class="form-field">
          <mat-label>Confirm Password</mat-label>
          <input matInput formControlName="confirmPassword" [type]="hideConfirmPassword ? 'password' : 'text'">
          <button mat-icon-button matSuffix type="button" (click)="hideConfirmPassword = !hideConfirmPassword">
            <mat-icon>{{ hideConfirmPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
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
  `]
})
export class ResetPasswordComponent {
  resetPasswordForm = new FormGroup({
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    confirmPassword: new FormControl('', [Validators.required])
  });


  
  hidePassword = true;
  hideConfirmPassword = true;

  
  onSubmit() {
    if (this.resetPasswordForm.valid) {
      // Handle password reset logic
    }
  }
}