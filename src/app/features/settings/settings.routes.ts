import { Routes } from '@angular/router';

export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/settings/settings.component')
      .then(m => m.SettingsComponent),
    children: [
      {
        path: 'users',
        loadComponent: () => import('./pages/user-list/user-list.component')
          .then(m => m.UserListComponent)
      },
      {
        path: 'users/new',
        loadComponent: () => import('./pages/user-form/user-form.component')
          .then(m => m.UserFormComponent)
      },
      {
        path: 'users/:id/edit',
        loadComponent: () => import('./pages/user-form/user-form.component')
          .then(m => m.UserFormComponent)
      },
      {
        path: 'roles',
        loadComponent: () => import('./pages/role-list/role-list.component')
          .then(m => m.RoleListComponent)
      },
      {
        path: 'roles/new',
        loadComponent: () => import('./pages/role-form/role-form.component')
          .then(m => m.RoleFormComponent)
      },
      {
        path: 'roles/:id/edit',
        loadComponent: () => import('./pages/role-form/role-form.component')
          .then(m => m.RoleFormComponent)
      },
      {
        path: 'roles/:id/permissions',
        loadComponent: () => import('./pages/permission-assignment/permission-assignment.component')
          .then(m => m.PermissionAssignmentComponent)
      },
      {
        path: 'permissions',
        loadComponent: () => import('./pages/permission-list/permission-list.component')
          .then(m => m.PermissionListComponent)
      },
      {
        path: 'permissions/new',
        loadComponent: () => import('./pages/permission-form/permission-form.component')
          .then(m => m.PermissionFormComponent)
      },
      {
        path: 'permissions/:id/edit',
        loadComponent: () => import('./pages/permission-form/permission-form.component')
          .then(m => m.PermissionFormComponent)
      },
      {
        path: '',
        redirectTo: 'users',
        pathMatch: 'full'
      }
    ]
  }
];
