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
        path: '',
        redirectTo: 'users',
        pathMatch: 'full'
      }
    ]
  }
];
