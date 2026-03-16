import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { API_URL } from '@core/models/tokens';
import { PagedResult } from '../models/user-management.model';
import {
  PermissionManagement,
  CreatePermissionRequest,
  UpdatePermissionRequest
} from '../models/permission-management.model';

@Injectable({ providedIn: 'root' })
export class PermissionManagementService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  getPermissions(page: number = 1, pageSize: number = 10): Observable<PagedResult<PermissionManagement>> {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<PagedResult<PermissionManagement>>(`${this.apiUrl}/permissions`, { params })
      .pipe(catchError(error => throwError(() => error)));
  }

  createPermission(request: CreatePermissionRequest): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/permissions`, request)
      .pipe(catchError(error => throwError(() => error)));
  }

  updatePermission(id: string, request: UpdatePermissionRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/permissions/${id}`, request)
      .pipe(catchError(error => throwError(() => error)));
  }

  toggleStatus(id: string, isActive: boolean): Observable<void> {
    const params = new HttpParams().set('isActive', isActive);
    return this.http.patch<void>(`${this.apiUrl}/permissions/${id}/status`, null, { params })
      .pipe(catchError(error => throwError(() => error)));
  }
}
