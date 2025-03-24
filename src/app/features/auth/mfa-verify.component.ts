// src/app/features/auth/mfa-verify.component.ts
import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from './auth.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-mfa-verify',
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
      <span class="top-label">Two-Factor Authentication</span>
      <p *ngIf="!setupMode">Enter the 6-digit code from your authenticator app</p>
      
      <!-- First-time setup mode with QR code -->
      <div *ngIf="setupMode" class="mfa-setup">
        <p>Scan this QR code with your authenticator app</p>
        <div class="qr-container">
          <img [src]="qrCodeUrl" alt="QR Code" class="qr-code" *ngIf="qrCodeUrl">
        </div>
        <p class="setup-instructions">
          1. Install Google Authenticator app<br>
          2. Scan this QR code<br>
          3. Enter the 6-digit code below to confirm setup
        </p>
      </div>
      
      <form [formGroup]="mfaForm" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="outline" class="form-field">
          <mat-label>Authentication Code</mat-label>
          <input matInput formControlName="code" type="text" autocomplete="off" maxlength="6">
          <mat-hint>Enter the 6-digit code</mat-hint>
          <mat-error *ngIf="mfaForm.controls.code.hasError('required')">Code is required</mat-error>
          <mat-error *ngIf="mfaForm.controls.code.hasError('pattern')">Must be 6 digits</mat-error>
        </mat-form-field>
        
        <button mat-flat-button class="submit-button" type="submit" [disabled]="isLoading || mfaForm.invalid">
          <span *ngIf="isLoading">Verifying...</span>
          <span *ngIf="!isLoading">{{ setupMode ? 'Confirm Setup' : 'Verify' }}</span>
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
    
    p {
      margin-top: 0;
      margin-bottom: 16px;
      font-size: 14px;
    }
    
    .form-field {
      width: 100%;
      margin-bottom: 16px;
    }
    
    .submit-button {
      width: 100%;
      background-color: #009c4c;
      color: white;
      padding: 12px;
      border-radius: 4px;
    }
    
    .qr-container {
      display: flex;
      justify-content: center;
      margin: 16px 0;
    }
    
    .qr-code {
      width: 180px;
      height: 180px;
      border: 1px solid #eee;
    }
    
    .setup-instructions {
      background-color: #f5f5f5;
      padding: 12px;
      border-radius: 4px;
      font-size: 13px;
      line-height: 1.5;
      margin-bottom: 20px;
    }
    
    .mfa-setup {
      margin-bottom: 16px;
    }
  `]
})
export class MfaVerifyComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  
  isLoading = false;
  setupMode = false; // Whether this is first-time setup or just verification
  qrCodeUrl = ''; // URL for the QR code image

  mfaForm = new FormGroup({
    code: new FormControl('', [
      Validators.required, 
      Validators.pattern(/^\d{6}$/)
    ])
  });
  
  ngOnInit(): void {
    // Check if we're in setup mode based on router state or auth service
    const navigation = this.router.getCurrentNavigation();
    
    if (navigation?.extras.state && navigation.extras.state['setupMode']) {
      this.setupMode = true;
    } else {
      // Check if user data indicates setup is required
      const tempUser = this.authService.getTempUserInfo();
      this.setupMode = tempUser?.mfaSetupRequired === true;
    }
  
    // Always check if MFA is required
    if (!this.authService.isMfaRequired()) {
      // No MFA in progress, redirect back to login
      this.router.navigate(['/auth/login']);
      return;
    }
    
    // If setup mode, fetch QR code from backend
    if (this.setupMode) {
      this.fetchQrCode();
    }
  }
  
  fetchQrCode(): void {
    this.isLoading = true;
    
    this.authService.getMfaSetup().subscribe({
      next: (response) => {
        this.qrCodeUrl = response.data.qrCodeUrl;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open(error.error?.message || 'Failed to get MFA setup', 'Close', { duration: 5000 });
        // Redirect back to login on error
        this.router.navigate(['/auth/login']);
      }
    });
  }
  
  onSubmit(): void {
    if (this.mfaForm.valid) {
      this.isLoading = true;
      const code = this.mfaForm.value.code || '';
      
      if (this.setupMode) {
        // Handle MFA setup confirmation
        this.authService.verifyMfaSetup(code).subscribe({
          next: (response) => {
            this.isLoading = false;
            this.snackBar.open('MFA setup successful', 'Close', { duration: 3000 });
            this.router.navigate(['/dashboard']);
          },
          error: (error) => {
            this.isLoading = false;
            this.snackBar.open(error.error?.message || 'Invalid code', 'Close', { duration: 5000 });
          }
        });
      } else {
        // Handle MFA verification during login
        this.authService.verifyMfaLogin(code).subscribe({
          next: (response) => {
            this.isLoading = false;
            this.snackBar.open('Authentication successful', 'Close', { duration: 3000 });
            this.router.navigate(['/dashboard']);
          },
          error: (error) => {
            this.isLoading = false;
            this.snackBar.open(error.error?.message || 'Invalid code', 'Close', { duration: 5000 });
          }
        });
      }
    }
  }
}