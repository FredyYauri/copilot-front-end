import { Routes } from '@angular/router';
import { permissionGuard } from '@core/guards/auth.guard';
import { unsavedChangesGuard } from './guards/unsaved-changes.guard';

export const DIRECTORY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/directory/directory.component')
      .then(m => m.DirectoryComponent),
    children: [
      {
        path: 'clients',
        loadComponent: () => import('./pages/client-list/client-list.component')
          .then(m => m.ClientListComponent),
        canActivate: [permissionGuard],
        data: { permissions: ['clients.read'] }
      },
      {
        path: 'clients/new',
        loadComponent: () => import('./pages/client-form/client-form.component')
          .then(m => m.ClientFormComponent),
        canActivate: [permissionGuard],
        data: { permissions: ['clients.create'] }
      },
      {
        path: 'clients/:id/edit',
        loadComponent: () => import('./pages/client-form/client-form.component')
          .then(m => m.ClientFormComponent),
        canActivate: [permissionGuard],
        canDeactivate: [unsavedChangesGuard],
        data: { permissions: ['clients.update'] }
      },
      {
        path: 'clients/:id',
        loadComponent: () => import('./pages/client-detail/client-detail.component')
          .then(m => m.ClientDetailComponent),
        canActivate: [permissionGuard],
        data: { permissions: ['clients.read'] }
      },
      {
        path: 'suppliers',
        loadComponent: () => import('./pages/supplier-list/supplier-list.component')
          .then(m => m.SupplierListComponent),
        canActivate: [permissionGuard],
        data: { permissions: ['suppliers.read'] }
      },
      {
        path: 'suppliers/new',
        loadComponent: () => import('./pages/supplier-form/supplier-form.component')
          .then(m => m.SupplierFormComponent),
        canActivate: [permissionGuard],
        data: { permissions: ['suppliers.create'] }
      },
      {
        path: 'suppliers/:id/edit',
        loadComponent: () => import('./pages/supplier-form/supplier-form.component')
          .then(m => m.SupplierFormComponent),
        canActivate: [permissionGuard],
        canDeactivate: [unsavedChangesGuard],
        data: { permissions: ['suppliers.update'] }
      },
      {
        path: '',
        redirectTo: 'clients',
        pathMatch: 'full'
      }
    ]
  }
];
