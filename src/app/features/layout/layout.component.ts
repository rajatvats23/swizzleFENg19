// src/app/features/layout/layout.component.ts

import { CommonModule } from '@angular/common';
import { Component, inject, signal, ViewChild, OnInit } from '@angular/core';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subject } from 'rxjs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { AuthService, User } from '../auth/auth.service';
import { navigationConfig, NavItem } from '../config/navigation.config';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterOutlet,
    MatSidenavModule,
    MatToolbarModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatMenuModule,
    MatTooltipModule
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class MainLayoutComponent implements OnInit {
  @ViewChild(MatDrawer) drawer!: MatDrawer;
  
  private router = inject(Router);
  authService = inject(AuthService);
  
  destroyed = new Subject<void>();
  showSidenavToggle = signal(true);
  isHandset = signal(false);
  isExpanded = signal(true);
  
  navItems = signal<NavItem[]>([]);
  currentUser = signal<User | null>(null);

  constructor() {
    inject(BreakpointObserver)
      .observe([Breakpoints.HandsetPortrait])
      .subscribe((result) => {
        this.isHandset.set(result.matches);
        if (this.drawer) {
          this.drawer.toggle();
        }
      });
  }
  
  ngOnInit(): void {
    // Get current user
    this.currentUser.set(this.authService.getCurrentUser());
    
    // Filter navigation items based on user role
    this.filterNavItems();
  }
  
  filterNavItems(): void {
    const user = this.currentUser();
    const filteredItems = navigationConfig.items.filter(item => {
      // If no roles specified, show to everyone
      if (!item.roles) {
        return true;
      }
      
      // If user has no role, don't show restricted items
      if (!user || !user.role) {
        return false;
      }
      
      // Show only if user's role is in the allowed roles
      return item.roles.includes(user.role);
    });
    
    this.navItems.set(filteredItems);
  }

  async toggleSidenavView() {
    if (this.drawer) {
      this.showSidenavToggle.set(false);
      await this.drawer.close().then(() => {
        this.isExpanded.set(!this.isExpanded());
        this.drawer.open().then(() => {
          this.showSidenavToggle.set(true);
        });
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }
}