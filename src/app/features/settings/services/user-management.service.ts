import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { API_URL } from '@core/models/tokens';
import {
  UserManagement,
  CreateUserRequest,
  UpdateUserRequest,
  PagedResult
} from '../models/user-management.model';

@Injectable({ providedIn: 'root' })
export class UserManagementService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  getUsers(page: number = 1, pageSize: number = 10): Observable<PagedResult<UserManagement>> {
    const params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    return this.http.get<PagedResult<UserManagement>>(`${this.apiUrl}/users`, { params }).pipe(
      catchError(error => throwError(() => error))
    );
  }

  getUserById(id: string): Observable<UserManagement> {
    return this.http.get<UserManagement>(`${this.apiUrl}/users/${id}`).pipe(
      catchError(error => throwError(() => error))
    );
  }

  createUser(request: CreateUserRequest): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/users`, request).pipe(
      catchError(error => throwError(() => error))
    );
  }

  updateUser(id: string, request: UpdateUserRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/users/${id}`, request).pipe(
      catchError(error => throwError(() => error))
    );
  }

  toggleStatus(id: string, isActive: boolean): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/users/${id}/status`, isActive).pipe(
      catchError(error => throwError(() => error))
    );
  }

  changeRole(id: string, roleId: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/users/${id}/role`, JSON.stringify(roleId), {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(
      catchError(error => throwError(() => error))
    );
  }
}
