import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { RoleManagementService } from '../../services/role-management.service';
import { PermissionGroup, Permission } from '../../models/role.model';

@Component({
  selector: 'app-permission-assignment',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './permission-assignment.component.html',
  styleUrl: './permission-assignment.component.scss'
})
export class PermissionAssignmentComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly roleService = inject(RoleManagementService);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal('');
  readonly roleName = signal('');
  readonly roleId = signal('');
  readonly permissionGroups = signal<PermissionGroup[]>([]);
  readonly selectedPermissionIds = signal<Set<string>>(new Set());

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.roleId.set(id);
      this.loadData(id);
    }
  }

  isSelected(permissionId: string): boolean {
    return this.selectedPermissionIds().has(permissionId);
  }

  togglePermission(permissionId: string): void {
    const current = new Set(this.selectedPermissionIds());
    if (current.has(permissionId)) {
      current.delete(permissionId);
    } else {
      current.add(permissionId);
    }
    this.selectedPermissionIds.set(current);
  }

  toggleGroup(group: PermissionGroup): void {
    const current = new Set(this.selectedPermissionIds());
    const allSelected = group.permissions.every(p => current.has(p.id));

    for (const perm of group.permissions) {
      if (allSelected) {
        current.delete(perm.id);
      } else {
        current.add(perm.id);
      }
    }
    this.selectedPermissionIds.set(current);
  }

  isGroupFullySelected(group: PermissionGroup): boolean {
    return group.permissions.every(p => this.selectedPermissionIds().has(p.id));
  }

  isGroupPartiallySelected(group: PermissionGroup): boolean {
    const selected = group.permissions.filter(p => this.selectedPermissionIds().has(p.id));
    return selected.length > 0 && selected.length < group.permissions.length;
  }

  getGroupSelectedCount(group: PermissionGroup): number {
    return group.permissions.filter(p => this.selectedPermissionIds().has(p.id)).length;
  }

  save(): void {
    this.saving.set(true);
    this.errorMessage.set('');

    const permissionIds = Array.from(this.selectedPermissionIds());
    this.roleService.assignPermissions(this.roleId(), { permissionIds }).subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['../../'], { relativeTo: this.route });
      },
      error: (err) => {
        this.saving.set(false);
        this.errorMessage.set(err?.error?.detail ?? 'Error al asignar permisos.');
      }
    });
  }

  private loadData(roleId: string): void {
    this.loading.set(true);

    this.roleService.getRoleById(roleId).subscribe({
      next: (role) => {
        this.roleName.set(role.name);
        const assignedIds = new Set(role.permissions.map((p: Permission) => p.id));
        this.selectedPermissionIds.set(assignedIds);
        this.loadPermissions();
      },
      error: () => {
        this.errorMessage.set('Error al cargar el rol.');
        this.loading.set(false);
      }
    });
  }

  private loadPermissions(): void {
    this.roleService.getPermissions().subscribe({
      next: (groups) => {
        this.permissionGroups.set(groups);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Error al cargar los permisos.');
        this.loading.set(false);
      }
    });
  }
}
