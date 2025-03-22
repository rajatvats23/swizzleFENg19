// src/app/features/config/navigation.config.ts

export interface NavItem {
    label: string;
    icon: string;
    route: string;
  }
  
  export const navigationConfig = {
    appTitle: 'Admin Dashboard',
    items: [
      { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
      { label: 'Users', icon: 'people', route: '/dashboard/users' },
      { 
        label: 'Restaurants', 
        icon: 'restaurant', 
        route: '/dashboard/restaurants',
        roles: ['admin', 'superadmin'] // Only show for admin and superadmin
      },
      { 
        label: 'My Restaurant', 
        icon: 'store', 
        route: '/dashboard/my-restaurant',
        roles: ['manager'] // Only show for manager
      }
    ]
  };