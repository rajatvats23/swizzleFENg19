import { CommonModule } from '@angular/common';
import { Component, inject, signal, ViewChild } from '@angular/core';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { RouterLink, RouterOutlet } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subject } from 'rxjs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { navigationConfig } from '../config/navigation.config';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

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
    MatMenuModule,
    MatTooltipModule
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class MainLayoutComponent {
  @ViewChild(MatDrawer) drawer!: MatDrawer;
  
  private router = inject(Router);
  authService = inject(AuthService);
  
  destroyed = new Subject<void>();
  showSidenavToggle = signal(true);
  isHandset = signal(false);
  isExpanded = signal(true);
  
  navItems = signal<NavItem[]>(navigationConfig.items);

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