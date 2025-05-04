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
      route: '/users',
      roles: ['superadmin', 'admin', 'manager'] // Not visible to staff
    },
    { 
      label: 'Restaurants', 
      icon: 'restaurant', 
      route: '/restaurants',
      roles: ['admin', 'superadmin'] // Only superadmin and admin
    },
    { 
      label: 'My Restaurant', 
      icon: 'store', 
      route: '/my-restaurant',
      roles: ['manager', 'staff'] // Only restaurant managers and staff
    },
    // Add this new menu item
    { 
      label: 'Menus', 
      icon: 'menu_book', 
      route: '/menus',
      roles: ['superadmin', 'admin', 'manager'] // All except staff
    },
    { 
      label: 'Categories', 
      icon: 'category', 
      route: '/categories',
      roles: ['superadmin', 'admin', 'manager', 'staff'] // All roles can view categories
    },
    { 
      label: 'Tags', 
      icon: 'local_offer', 
      route: '/tags',
      roles: ['superadmin', 'admin', 'manager', 'staff'] // All roles can view tags
    },
    { 
      label: 'Products', 
      icon: 'fastfood', 
      route: '/products',
      roles: ['superadmin', 'admin', 'manager', 'staff'] // All roles can view products
    },
    { 
      label: 'Addons', 
      icon: 'add_circle', 
      route: '/addons',
      roles: ['manager'] // Only visible to restaurant managers
    },
    {
      label: 'Tables',
      icon: 'table_bar',
      route: '/tables',
      roles: ['manager', 'staff']
    }
  ]
};