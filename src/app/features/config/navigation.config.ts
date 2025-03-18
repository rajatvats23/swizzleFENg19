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
      { label: 'Users', icon: 'people', route: '/dashboard/users' }
      // Add more navigation items as needed
    ]
  };