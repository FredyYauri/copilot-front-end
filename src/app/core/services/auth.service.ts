import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError, of } from 'rxjs';
import { API_URL } from '@core/models/tokens';
import { LoginRequest, LoginResponse, User, ForgotPasswordRequest } from '@core/models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = inject(API_URL);

  private readonly currentUser = signal<User | null>(null);
  private readonly token = signal<string | null>(null);

  readonly user = this.currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this.token());
  readonly accessToken = this.token.asReadonly();

  hasPermission(code: string): boolean {
    return this.currentUser()?.permissions?.includes(code) ?? false;
  }

  hasAnyPermission(...codes: string[]): boolean {
    const perms = this.currentUser()?.permissions;
    if (!perms) return false;
    return codes.some(c => perms.includes(c));
  }

  constructor() {
    this.loadStoredSession();
  }

  login(credentials: LoginRequest): Observable<LoginResponse | null> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        this.token.set(response.accessToken);
        this.currentUser.set(response.user);
        sessionStorage.setItem('accessToken', response.accessToken);
        sessionStorage.setItem('user', JSON.stringify(response.user));
      }),
      catchError((error) => throwError(() => error?.error?.detail ?? 'Error de conexión. Intenta más tarde.'))
    );
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/auth/forgot-password`, request).pipe(
      catchError(() => of(false))
    );
  }

  logout(): void {
    this.token.set(null);
    this.currentUser.set(null);
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('user');
    this.router.navigate(['/auth/login']);
  }

  private loadStoredSession(): void {
    const storedToken = sessionStorage.getItem('accessToken');
    const storedUser = sessionStorage.getItem('user');

    if (storedToken && storedUser) {
      this.token.set(storedToken);
      try {
        this.currentUser.set(JSON.parse(storedUser) as User);
      } catch {
        this.logout();
      }
    }
  }
}
