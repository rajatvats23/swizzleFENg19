// src/app/features/config/navigation.config.ts

export interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[]; 
}

export const navigationConfig = {
  appTitle: 'Admin Dashboard',
  items: [
    { 
      label: 'Dashboard', 
      icon: 'dashboard', 
      route: '/dashboard'
    },
    { 
      label: 'Users', 
      icon: 'people', 
      route: '/dashboard/users',
      roles: ['superadmin', 'admin', 'manager'] // Not visible to staff
    },
    { 
      label: 'Restaurants', 
      icon: 'restaurant', 
      route: '/dashboard/restaurants',
      roles: ['admin', 'superadmin'] // Only superadmin and admin
    },
    { 
      label: 'My Restaurant', 
      icon: 'store', 
      route: '/dashboard/my-restaurant',
      roles: ['manager', 'staff'] // Only restaurant managers and staff
    },
    // Add this new menu item
    { 
      label: 'Menus', 
      icon: 'menu_book', 
      route: '/dashboard/menus',
      roles: ['superadmin', 'admin', 'manager'] // All except staff
    },
    { 
      label: 'Categories', 
      icon: 'category', 
      route: '/dashboard/categories',
      roles: ['superadmin', 'admin', 'manager', 'staff'] // All roles can view categories
    }
  ]
};