// src/app/core/guards/role.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../../features/auth/auth.service';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    
    const user = authService.getTempUserInfo();
    
    if (user && allowedRoles.includes(user.role)) {
      return true;
    }
    
    // Navigate to dashboard if role not allowed
    router.navigate(['/dashboard']);
    return false;
  };
};

// You can then use this guard in your routes:
// Example:
// {
//   path: 'dashboard/restaurants',
//   loadComponent: () => import('./features/restaurants/restaurant-list.component').then(m => m.RestaurantListComponent),
//   canActivate: [authGuard, () => roleGuard(['admin', 'superadmin'])]
// }