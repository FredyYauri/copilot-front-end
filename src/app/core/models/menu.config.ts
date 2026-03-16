export interface MenuItem {
  label: string;
  icon: string;
  route: string;
  permissions?: string[];
  children?: MenuItem[];
}

export const MENU_CONFIG: MenuItem[] = [
  {
    label: 'Dashboard',
    icon: '📊',
    route: '/dashboard',
  },
  {
    label: 'Configuración',
    icon: '⚙️',
    route: '/settings',
    children: [
      { label: 'Usuarios', icon: '👥', route: '/settings/users', permissions: ['users.read'] },
      { label: 'Roles', icon: '🔐', route: '/settings/roles', permissions: ['roles.read'] },
      { label: 'Permisos', icon: '🛡️', route: '/settings/permissions', permissions: ['permissions.read'] },
    ]
  }
];
