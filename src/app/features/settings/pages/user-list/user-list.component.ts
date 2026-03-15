import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { UserManagementService } from '../../services/user-management.service';
import { UserManagement, PagedResult } from '../../models/user-management.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [RouterLink, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent implements OnInit {
  private readonly userService = inject(UserManagementService);

  readonly users = signal<UserManagement[]>([]);
  readonly loading = signal(false);
  readonly currentPage = signal(1);
  readonly totalPages = signal(0);
  readonly totalCount = signal(0);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.userService.getUsers(this.currentPage(), 10).subscribe({
      next: (result: PagedResult<UserManagement>) => {
        this.users.set(result.items);
        this.totalPages.set(result.totalPages);
        this.totalCount.set(result.totalCount);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Error al cargar los usuarios.');
        this.loading.set(false);
      }
    });
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadUsers();
  }

  onToggleStatus(user: UserManagement): void {
    const newStatus = !user.isActive;
    this.userService.toggleStatus(user.id, newStatus).subscribe({
      next: () => this.loadUsers(),
      error: () => this.errorMessage.set('Error al cambiar el estado del usuario.')
    });
  }
}
