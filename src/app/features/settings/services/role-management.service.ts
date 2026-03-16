import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { API_URL } from '@core/models/tokens';
import { PagedResult } from '../models/user-management.model';
import {
  Role,
  RoleDetail,
  CreateRoleRequest,
  UpdateRoleRequest,
  AssignPermissionsRequest,
  PermissionGroup,
  UserPermissions
} from '../models/role.model';

@Injectable({ providedIn: 'root' })
export class RoleManagementService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  getRoles(page: number = 1, pageSize: number = 10): Observable<PagedResult<Role>> {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<PagedResult<Role>>(`${this.apiUrl}/roles`, { params })
      .pipe(catchError(error => throwError(() => error)));
  }

  getRoleById(id: string): Observable<RoleDetail> {
    return this.http.get<RoleDetail>(`${this.apiUrl}/roles/${id}`)
      .pipe(catchError(error => throwError(() => error)));
  }

  createRole(request: CreateRoleRequest): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/roles`, request)
      .pipe(catchError(error => throwError(() => error)));
  }

  updateRole(id: string, request: UpdateRoleRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/roles/${id}`, request)
      .pipe(catchError(error => throwError(() => error)));
  }

  assignPermissions(roleId: string, request: AssignPermissionsRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/roles/${roleId}/permissions`, request)
      .pipe(catchError(error => throwError(() => error)));
  }

  getPermissions(): Observable<PermissionGroup[]> {
    return this.http.get<PermissionGroup[]>(`${this.apiUrl}/permissions/grouped`)
      .pipe(catchError(error => throwError(() => error)));
  }

  getUserPermissions(userId: string): Observable<UserPermissions> {
    return this.http.get<UserPermissions>(`${this.apiUrl}/permissions/user/${userId}`)
      .pipe(catchError(error => throwError(() => error)));
  }
}
