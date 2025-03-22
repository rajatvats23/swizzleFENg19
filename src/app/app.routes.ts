import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

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
      }
    ]
  },
  {
    path: 'dashboard/restaurants',
    loadComponent: () => import('./features/restaurants/restaurant-list.component').then(m => m.RestaurantListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'dashboard/restaurants/new',
    loadComponent: () => import('./features/restaurants/restaurant-form.component').then(m => m.RestaurantFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'dashboard/restaurants/:id',
    loadComponent: () => import('./features/restaurants/restaurant-details.component').then(m => m.RestaurantDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: 'dashboard/restaurants/:id/edit',
    loadComponent: () => import('./features/restaurants/restaurant-form.component').then(m => m.RestaurantFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'dashboard/my-restaurant',
    loadComponent: () => import('./features/restaurants/manager-restaurant.component').then(m => m.ManagerRestaurantComponent),
    canActivate: [authGuard]
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