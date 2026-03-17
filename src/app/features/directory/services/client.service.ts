import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { API_URL } from '@core/models/tokens';
import {
  Client,
  ClientDetail,
  CreateClientRequest,
  UpdateClientRequest,
  ClientSearch,
  PagedResult
} from '../models/client.model';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  getClients(page: number = 1, pageSize: number = 10): Observable<PagedResult<Client>> {
    const params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    return this.http.get<PagedResult<Client>>(`${this.apiUrl}/clients`, { params }).pipe(
      catchError(error => throwError(() => error))
    );
  }

  getClientById(id: string): Observable<ClientDetail> {
    return this.http.get<ClientDetail>(`${this.apiUrl}/clients/${id}`).pipe(
      catchError(error => throwError(() => error))
    );
  }

  createClient(request: CreateClientRequest): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/clients`, request).pipe(
      catchError(error => throwError(() => error))
    );
  }

  updateClient(id: string, request: UpdateClientRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/clients/${id}`, request).pipe(
      catchError(error => throwError(() => error))
    );
  }

  searchClients(query: string, maxResults: number = 10): Observable<ClientSearch[]> {
    const params = new HttpParams()
      .set('q', query)
      .set('maxResults', maxResults);

    return this.http.get<ClientSearch[]>(`${this.apiUrl}/clients/search`, { params }).pipe(
      catchError(error => throwError(() => error))
    );
  }
}
