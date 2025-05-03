import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // Auth routes
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
  
  // Main layout - all authenticated routes will use this layout
  {
    path: '',
    loadComponent: () => import('./features/layout/layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      // Dashboard route
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      
      // Users route
      {
        path: 'users',
        loadComponent: () => import('./features/users/users.component').then(m => m.UsersComponent)
      },
      
      // Restaurant routes
      {
        path: 'restaurants',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/restaurants/restaurant-list.component').then(m => m.RestaurantListComponent),
            canActivate: [() => roleGuard(['admin', 'superadmin'])]
          },
          {
            path: ':id',
            loadComponent: () => import('./features/restaurants/restaurant-details.component').then(m => m.RestaurantDetailComponent),
            canActivate: [() => roleGuard(['admin', 'superadmin'])]
          }
        ]
      },
      {
        path: 'my-restaurant',
        loadComponent: () => import('./features/restaurants/manager-restaurant.component').then(m => m.ManagerRestaurantComponent),
        canActivate: [() => roleGuard(['manager'])]
      },
      
      // Table routes
      {
        path: 'tables',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/tables/table-list.component').then(m => m.TableListComponent),
            canActivate: [() => roleGuard(['manager', 'staff'])]
          },
          {
            path: 'create',
            loadComponent: () => import('./features/tables/table-form.component').then(m => m.TableFormComponent),
            canActivate: [() => roleGuard(['manager'])]
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./features/tables/table-form.component').then(m => m.TableFormComponent),
            canActivate: [() => roleGuard(['manager'])]
          },
          {
            path: ':id',
            loadComponent: () => import('./features/tables/table-detail.component').then(m => m.TableDetailComponent),
            canActivate: [() => roleGuard(['manager', 'staff'])]
          }
        ]
      },
      
      // Menu routes
      {
        path: 'menus',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/menus/menu-list.component').then(m => m.MenuListComponent)
          },
          {
            path: 'create',
            loadComponent: () => import('./features/menus/menu-form.component').then(m => m.MenuFormComponent),
            canActivate: [() => roleGuard(['manager'])]
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./features/menus/menu-form.component').then(m => m.MenuFormComponent),
            canActivate: [() => roleGuard(['manager'])]
          },
          {
            path: ':id',
            loadComponent: () => import('./features/menus/menu-details.component').then(m => m.MenuDetailComponent)
          }
        ]
      },
      
      // Category routes
      {
        path: 'categories',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/category/category-list.component').then(m => m.CategoryListComponent)
          },
          {
            path: 'create',
            loadComponent: () => import('./features/category/category-form.component').then(m => m.CategoryFormComponent),
            canActivate: [() => roleGuard(['manager'])]
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./features/category/category-form.component').then(m => m.CategoryFormComponent),
            canActivate: [() => roleGuard(['manager', 'staff'])]
          },
          {
            path: ':id',
            loadComponent: () => import('./features/category/category-details.component').then(m => m.CategoryDetailComponent)
          }
        ]
      },
      
      // Tag routes
      {
        path: 'tags',
        loadComponent: () => import('./features/tag/tag.component').then(m => m.TagListComponent)
      },
      
      // Product routes
      {
        path: 'products',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/products/product-list.component').then(m => m.ProductListComponent)
          },
          {
            path: 'create',
            loadComponent: () => import('./features/products/product-form.component').then(m => m.ProductFormComponent),
            canActivate: [() => roleGuard(['manager'])]
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./features/products/product-form.component').then(m => m.ProductFormComponent),
            canActivate: [() => roleGuard(['manager'])]
          },
          {
            path: ':id',
            loadComponent: () => import('./features/products/product-details.component').then(m => m.ProductDetailComponent)
          }
        ]
      },
      
      // Addon routes
      {
        path: 'addons',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/addons/addon-list.component').then(m => m.AddonListComponent),
            canActivate: [() => roleGuard(['manager'])]
          },
          {
            path: 'create',
            loadComponent: () => import('./features/addons/addon-form.component').then(m => m.AddonFormComponent),
            canActivate: [() => roleGuard(['manager'])]
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./features/addons/addon-form.component').then(m => m.AddonFormComponent),
            canActivate: [() => roleGuard(['manager'])]
          },
          {
            path: ':id',
            loadComponent: () => import('./features/addons/addon-details.component').then(m => m.AddonDetailComponent),
            canActivate: [() => roleGuard(['manager'])]
          }
        ]
      },
      
      // Default route redirects
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  
  // Public route for table QR code access
  {
    path: 'table/:qrCodeId',
    loadComponent: () => import('./features/tables/customer-table-view.component').then(m => m.CustomerTableViewComponent)
  },
  
  // Fallback route
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];