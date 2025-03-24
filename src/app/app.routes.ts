import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { MenuListComponent } from './features/menus/menu-list.component';
import { MenuFormComponent } from './features/menus/menu-form.component';
import { MenuDetailComponent } from './features/menus/menu-details.component';

export const routes: Routes = [
  {
    path: 'auth',
    loadComponent: () => import('./features/auth/auth-landing-component').then(m => m.AuthLandingComponent),
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./features/auth/forgot-password.component').then(m => m.ForgotPasswordComponent)
      },
      {
        path: 'check-email',
        loadComponent: () => import('./features/auth/check-email.component').then(m => m.CheckEmailComponent)
      },
      {
        path: 'reset-password/:token',
        loadComponent: () => import('./features/auth/reset-password.component').then(m => m.ResetPasswordComponent)
      },
      {
        path: 'register/:token',
        loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent)
      },
      {
        path: 'mfa-verify',
        loadComponent: () => import('./features/auth/mfa-verify.component').then(m => m.MfaVerifyComponent)
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/layout/layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./features/users/users.component').then(m => m.UsersComponent)
      },
      {
        path: 'restaurants',
        loadComponent: () => import('./features/restaurants/restaurant-list.component').then(m => m.RestaurantListComponent),
        canActivate: [() => roleGuard(['admin', 'superadmin'])]
      },
      {
        path: 'restaurants/:id',
        loadComponent: () => import('./features/restaurants/restaurant-details.component').then(m => m.RestaurantDetailComponent),
        canActivate: [() => roleGuard(['admin', 'superadmin'])]
      },
      {
        path: 'my-restaurant',
        loadComponent: () => import('./features/restaurants/manager-restaurant.component').then(m => m.ManagerRestaurantComponent),
        canActivate: [() => roleGuard(['manager'])]
      },
      {
        path: 'menus',
        loadComponent: () => Promise.resolve(MenuListComponent)
      },
      {
        path: 'menus/create',
        loadComponent: () => Promise.resolve(MenuFormComponent),
        canActivate: [() => roleGuard(['manager'])]
      },
      {
        path: 'menus/edit/:id',
        loadComponent: () => Promise.resolve(MenuFormComponent),
        canActivate: [() => roleGuard(['manager'])]
      },
      {
        path: 'menus/:id',
        loadComponent: () => Promise.resolve(MenuDetailComponent)
      }
    ]
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];