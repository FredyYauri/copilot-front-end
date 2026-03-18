import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { API_URL } from '@core/models/tokens';
import { PagedResult } from '../models/client.model';
import {
  Supplier,
  SupplierDetail,
  CreateSupplierRequest,
  UpdateSupplierRequest,
  UpdateSupplierContactsRequest,
  SupplierSearch
} from '../models/supplier.model';

@Injectable({ providedIn: 'root' })
export class SupplierService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  getSuppliers(page: number = 1, pageSize: number = 10): Observable<PagedResult<Supplier>> {
    const params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    return this.http.get<PagedResult<Supplier>>(`${this.apiUrl}/suppliers`, { params }).pipe(
      catchError(error => throwError(() => error))
    );
  }

  getSupplierById(id: string): Observable<SupplierDetail> {
    return this.http.get<SupplierDetail>(`${this.apiUrl}/suppliers/${id}`).pipe(
      catchError(error => throwError(() => error))
    );
  }

  createSupplier(request: CreateSupplierRequest): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/suppliers`, request).pipe(
      catchError(error => throwError(() => error))
    );
  }

  updateSupplier(id: string, request: UpdateSupplierRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/suppliers/${id}`, request).pipe(
      catchError(error => throwError(() => error))
    );
  }

  updateSupplierContacts(id: string, request: UpdateSupplierContactsRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/suppliers/${id}/contacts`, request).pipe(
      catchError(error => throwError(() => error))
    );
  }

  searchSuppliers(query: string, maxResults: number = 10): Observable<SupplierSearch[]> {
    const params = new HttpParams()
      .set('q', query)
      .set('maxResults', maxResults);

    return this.http.get<SupplierSearch[]>(`${this.apiUrl}/suppliers/search`, { params }).pipe(
      catchError(error => throwError(() => error))
    );
  }
}
