import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { MenuListComponent } from './features/menus/menu-list.component';
import { MenuFormComponent } from './features/menus/menu-form.component';
import { MenuDetailComponent } from './features/menus/menu-details.component';
import { CategoryListComponent } from './features/category/category-list.component';
import { CategoryFormComponent } from './features/category/category-form.component';
import { CategoryDetailComponent } from './features/category/category-details.component';
import { ProductFormComponent } from './features/products/product-form.component';
import { ProductListComponent } from './features/products/product-list.component';
import { TagListComponent } from './features/tag/tag.component';
import { ProductDetailComponent } from './features/products/product-details.component';
import { AddonDetailComponent } from './features/addons/addon-details.component';
import { AddonFormComponent } from './features/addons/addon-form.component';
import { AddonListComponent } from './features/addons/addon-list.component';

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
      },
      {
        path: 'categories',
        loadComponent: () => Promise.resolve(CategoryListComponent)
      },
      {
        path: 'categories/create',
        loadComponent: () => Promise.resolve(CategoryFormComponent),
        canActivate: [() => roleGuard(['manager'])]
      },
      {
        path: 'categories/edit/:id',
        loadComponent: () => Promise.resolve(CategoryFormComponent),
        canActivate: [() => roleGuard(['manager', 'staff'])]
      },
      {
        path: 'categories/:id',
        loadComponent: () => Promise.resolve(CategoryDetailComponent)
      },
      {
        path: 'tags',
        component: TagListComponent
      },
      
      // Product routes
      {
        path: 'products',
        component: ProductListComponent
      },
      {
        path: 'products/create',
        component: ProductFormComponent,
        canActivate: [() => roleGuard(['manager'])]
      },
      {
        path: 'products/edit/:id',
        component: ProductFormComponent,
        canActivate: [() => roleGuard(['manager'])]
      },
      {
        path: 'products/:id',
        component: ProductDetailComponent
      },
      {
        path: 'addons',
        component: AddonListComponent,
        canActivate: [() => roleGuard(['manager'])]
      },
      {
        path: 'addons/create',
        component: AddonFormComponent,
        canActivate: [() => roleGuard(['manager'])]
      },
      {
        path: 'addons/edit/:id',
        component: AddonFormComponent,
        canActivate: [() => roleGuard(['manager'])]
      },
      {
        path: 'addons/:id',
        component: AddonDetailComponent,
        canActivate: [() => roleGuard(['manager'])]
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