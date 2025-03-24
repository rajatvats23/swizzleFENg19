// check-email.component.ts
import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-check-email',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule],
  template: `
    <div class="auth-content">
      <span class="top-label">Check your Email</span>
      <p>We have sent a Password link to {{ email }}</p>
      
      <button mat-flat-button class="back-button" routerLink="/auth/sign-in">Back to Login</button>
      
      <div class="resend-container">
        <span>Didn't receive the email?</span>
        <button class="resend-link" (click)="resendEmail()">Click to resend</button>
      </div>
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
    
    .back-button {
      width: 100%;
      background-color: #009c4c;
      color: white;
      padding: 12px;
      margin-bottom: 16px;
      border-radius: 4px;
    }
    
    .resend-container {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 14px;
      color: #666;
    }
    
    .resend-link {
      background: none;
      border: none;
      color: #FF5252;
      padding: 0;
      cursor: pointer;
      font-size: 14px;
    }
  `]
})
export class CheckEmailComponent {
  email = '1234@gmail.com'; // This would be passed via state/route or service
  
  resendEmail() {
    // Handle resend email logic
  }
}