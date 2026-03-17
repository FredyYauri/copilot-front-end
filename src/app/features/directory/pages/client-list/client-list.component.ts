import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ClientService } from '../../services/client.service';
import { Client, PagedResult } from '../../models/client.model';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [RouterLink, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.scss'
})
export class ClientListComponent implements OnInit {
  private readonly clientService = inject(ClientService);

  readonly clients = signal<Client[]>([]);
  readonly loading = signal(false);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly pageSizeOptions = [5, 10, 25, 50];
  readonly totalPages = signal(0);
  readonly totalCount = signal(0);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.clientService.getClients(this.currentPage(), this.pageSize()).subscribe({
      next: (result: PagedResult<Client>) => {
        this.clients.set(result.items);
        this.totalPages.set(result.totalPages);
        this.totalCount.set(result.totalCount);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Error al cargar los clientes.');
        this.loading.set(false);
      }
    });
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadClients();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.loadClients();
  }
}
