import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { RoleManagementService } from '../../services/role-management.service';
import { Role } from '../../models/role.model';
import { PagedResult } from '../../models/user-management.model';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [RouterLink, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './role-list.component.html',
  styleUrl: './role-list.component.scss'
})
export class RoleListComponent implements OnInit {
  private readonly roleService = inject(RoleManagementService);

  readonly roles = signal<Role[]>([]);
  readonly loading = signal(false);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly pageSizeOptions = [5, 10, 25, 50];
  readonly totalPages = signal(0);
  readonly totalCount = signal(0);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.roleService.getRoles(this.currentPage(), this.pageSize()).subscribe({
      next: (result: PagedResult<Role>) => {
        this.roles.set(result.items);
        this.totalPages.set(result.totalPages);
        this.totalCount.set(result.totalCount);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Error al cargar los roles.');
        this.loading.set(false);
      }
    });
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadRoles();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.loadRoles();
  }
}
