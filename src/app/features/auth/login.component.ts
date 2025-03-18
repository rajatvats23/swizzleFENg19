// sign-in.component.ts
import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="auth-content">
      <h1>Welcome!</h1>
      <h2>Sign in to Get Started</h2>
      
      <form [formGroup]="signInForm" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="outline" class="form-field">
          <mat-label>Enter Your Email</mat-label>
          <input matInput formControlName="email" type="email">
        </mat-form-field>
        
        <mat-form-field appearance="outline" class="form-field">
          <mat-label>Password</mat-label>
          <input matInput formControlName="password" [type]="hidePassword ? 'password' : 'text'">
          <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword">
            <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
        </mat-form-field>
        
        <div class="forgot-password">
          <a routerLink="/auth/forgot-password" class="forgot-link">Forgot Password</a>
        </div>
        
        <button mat-flat-button class="sign-in-button" type="submit">Sign in</button>
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
      margin-bottom: 8px;
    }
    
    .forgot-password {
      text-align: right;
      margin-bottom: 24px;
    }
    
    .forgot-link {
      color: #FF5252;
      text-decoration: none;
      font-size: 14px;
    }
    
    .sign-in-button {
      width: 100%;
      background-color: #009c4c;
      color: white;
      padding: 12px;
      border-radius: 4px;
    }
  `]
})
export class LoginComponent {
  signInForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  });
  
  hidePassword = true;
  
  onSubmit() {
    if (this.signInForm.valid) {
      // Handle sign in logic
    }
  }
}