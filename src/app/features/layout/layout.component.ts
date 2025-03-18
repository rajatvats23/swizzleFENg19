// app/layout/main-layout.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterOutlet,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatMenuModule
  ],
  template: `
    <div class="layout-container">
      <mat-toolbar color="primary">
        <button mat-icon-button (click)="drawer.toggle()">
          <mat-icon>menu</mat-icon>
        </button>
        <span>Admin Dashboard</span>
        <span class="toolbar-spacer"></span>
        <button mat-icon-button [matMenuTriggerFor]="profileMenu">
          <mat-icon>account_circle</mat-icon>
        </button>
        <mat-menu #profileMenu="matMenu">
          <button mat-menu-item (click)="logout()">
            <mat-icon>exit_to_app</mat-icon>
            <span>Logout</span>
          </button>
        </mat-menu>
      </mat-toolbar>

      <mat-sidenav-container class="sidenav-container">
        <mat-sidenav #drawer mode="side" opened class="sidenav">
          <mat-nav-list>
            <a mat-list-item routerLink="users" routerLinkActive="active-link">
              <mat-icon>people</mat-icon>
              <span class="nav-item-text">Users</span>
            </a>
          </mat-nav-list>
        </mat-sidenav>

        <mat-sidenav-content class="content">
          <router-outlet></router-outlet>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [`
    .layout-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    .toolbar-spacer {
      flex: 1 1 auto;
    }

    .sidenav-container {
      flex: 1;
    }

    .sidenav {
      width: 250px;
    }

    .content {
      padding: 20px;
    }

    .active-link {
      background-color: rgba(0, 0, 0, 0.04);
    }

    .nav-item-text {
      margin-left: 10px;
    }
  `]
})
export class MainLayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}