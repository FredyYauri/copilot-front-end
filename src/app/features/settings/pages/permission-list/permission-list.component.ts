import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { PermissionManagementService } from '../../services/permission-management.service';
import { PermissionManagement, PERMISSION_TYPES } from '../../models/permission-management.model';
import { PagedResult } from '../../models/user-management.model';

@Component({
  selector: 'app-permission-list',
  standalone: true,
  imports: [RouterLink, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './permission-list.component.html',
  styleUrl: './permission-list.component.scss'
})
export class PermissionListComponent implements OnInit {
  private readonly permissionService = inject(PermissionManagementService);

  readonly permissions = signal<PermissionManagement[]>([]);
  readonly loading = signal(false);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly pageSizeOptions = [5, 10, 25, 50];
  readonly totalPages = signal(0);
  readonly totalCount = signal(0);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    this.loadPermissions();
  }

  loadPermissions(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.permissionService.getPermissions(this.currentPage(), this.pageSize()).subscribe({
      next: (result: PagedResult<PermissionManagement>) => {
        this.permissions.set(result.items);
        this.totalPages.set(result.totalPages);
        this.totalCount.set(result.totalCount);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Error al cargar los permisos.');
        this.loading.set(false);
      }
    });
  }

  private readonly protectedResources = ['permissions', 'roles', 'users'];

  getTypeLabel(type: string): string {
    return PERMISSION_TYPES.find(t => t.value === type)?.label ?? type;
  }

  isProtected(permission: PermissionManagement): boolean {
    return this.protectedResources.includes(permission.resource);
  }

  toggleStatus(permission: PermissionManagement): void {
    this.permissionService.toggleStatus(permission.id, !permission.isActive).subscribe({
      next: () => this.loadPermissions(),
      error: () => this.errorMessage.set('Error al cambiar el estado del permiso.')
    });
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadPermissions();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.loadPermissions();
  }
}
