// auth-landing.component.ts
import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-auth-landing',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatCardModule],
  template: `
    <div class="auth-landing">
      <div class="card-container">
        <mat-card class="auth-card">
          <router-outlet></router-outlet>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .auth-landing {
      width: 100%;
      height: 100vh;
      background-image: url('/assets/auth-bg.svg');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      display: flex;
      margin: 0;
      padding: 0;
    }

    .card-container {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      padding: 2rem;
    }

    .auth-card {
      max-width: 450px;
      min-width: 320px;
      width: 40%;
      height: auto;
      padding: 2rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
      background-color: white;
    }

    /* Media query for screens smaller than 600px */
    @media (max-width: 600px) {
      .card-container {
        justify-content: center;
        padding: 1rem;
      }

      .auth-card {
        width: 90%;
        max-width: 100%;
      }
    }
  `]
})
export class AuthLandingComponent {
}