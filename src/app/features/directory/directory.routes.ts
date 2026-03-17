import { Routes } from '@angular/router';

export const DIRECTORY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/directory/directory.component')
      .then(m => m.DirectoryComponent),
    children: [
      {
        path: 'clients',
        loadComponent: () => import('./pages/client-list/client-list.component')
          .then(m => m.ClientListComponent)
      },
      {
        path: 'clients/new',
        loadComponent: () => import('./pages/client-form/client-form.component')
          .then(m => m.ClientFormComponent)
      },
      {
        path: 'clients/:id/edit',
        loadComponent: () => import('./pages/client-form/client-form.component')
          .then(m => m.ClientFormComponent)
      },
      {
        path: '',
        redirectTo: 'clients',
        pathMatch: 'full'
      }
    ]
  }
];
