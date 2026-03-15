import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { API_URL } from '@core/models/tokens';
import { LoginResponse, User } from '@core/models/user.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpTesting: HttpTestingController;
  let router: jasmine.SpyObj<Router>;
  const apiUrl = 'http://test-api.com/api';

  const mockUser: User = {
    id: '1',
    email: 'test@test.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'admin'
  };

  const mockLoginResponse: LoginResponse = {
    accessToken: 'mock-token-123',
    refreshToken: 'mock-refresh-456',
    user: mockUser
  };

  beforeEach(() => {
    sessionStorage.clear();
    router = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: apiUrl },
        { provide: Router, useValue: router }
      ]
    });

    service = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should not be authenticated initially', () => {
    expect(service.isAuthenticated()).toBeFalse();
    expect(service.user()).toBeNull();
    expect(service.accessToken()).toBeNull();
  });

  describe('login', () => {
    it('should login successfully and store session', () => {
      service.login({ email: 'test@test.com', password: 'password123' }).subscribe(response => {
        expect(response).toEqual(mockLoginResponse);
      });

      const req = httpTesting.expectOne(`${apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'test@test.com', password: 'password123' });
      req.flush(mockLoginResponse);

      expect(service.isAuthenticated()).toBeTrue();
      expect(service.accessToken()).toBe('mock-token-123');
      expect(service.user()).toEqual(mockUser);
      expect(sessionStorage.getItem('accessToken')).toBe('mock-token-123');
      expect(sessionStorage.getItem('user')).toBe(JSON.stringify(mockUser));
    });

    it('should return null on login error', () => {
      service.login({ email: 'test@test.com', password: 'wrong' }).subscribe(response => {
        expect(response).toBeNull();
      });

      const req = httpTesting.expectOne(`${apiUrl}/auth/login`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('forgotPassword', () => {
    it('should return true on success', () => {
      service.forgotPassword({ email: 'test@test.com' }).subscribe(result => {
        expect(result).toBeTrue();
      });

      const req = httpTesting.expectOne(`${apiUrl}/auth/forgot-password`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'test@test.com' });
      req.flush(true);
    });

    it('should return false on error', () => {
      service.forgotPassword({ email: 'test@test.com' }).subscribe(result => {
        expect(result).toBeFalse();
      });

      const req = httpTesting.expectOne(`${apiUrl}/auth/forgot-password`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('logout', () => {
    it('should clear session and navigate to login', () => {
      // First login
      service.login({ email: 'test@test.com', password: 'password123' }).subscribe();
      httpTesting.expectOne(`${apiUrl}/auth/login`).flush(mockLoginResponse);

      // Then logout
      service.logout();

      expect(service.isAuthenticated()).toBeFalse();
      expect(service.user()).toBeNull();
      expect(service.accessToken()).toBeNull();
      expect(sessionStorage.getItem('accessToken')).toBeNull();
      expect(sessionStorage.getItem('user')).toBeNull();
      expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
    });
  });

  describe('loadStoredSession', () => {
    function createServiceWithStorage(): void {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          { provide: API_URL, useValue: apiUrl },
          { provide: Router, useValue: router }
        ]
      });
      service = TestBed.inject(AuthService);
      httpTesting = TestBed.inject(HttpTestingController);
    }

    it('should restore session from sessionStorage', () => {
      sessionStorage.setItem('accessToken', 'stored-token');
      sessionStorage.setItem('user', JSON.stringify(mockUser));

      createServiceWithStorage();

      expect(service.isAuthenticated()).toBeTrue();
      expect(service.accessToken()).toBe('stored-token');
      expect(service.user()).toEqual(mockUser);
    });

    it('should not restore session when storage is empty', () => {
      sessionStorage.clear();

      createServiceWithStorage();

      expect(service.isAuthenticated()).toBeFalse();
      expect(service.user()).toBeNull();
    });

    it('should logout when stored user JSON is invalid', () => {
      sessionStorage.setItem('accessToken', 'stored-token');
      sessionStorage.setItem('user', 'invalid-json{{{');

      createServiceWithStorage();

      expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
      expect(service.isAuthenticated()).toBeFalse();
    });

    it('should not restore when only token is present without user', () => {
      sessionStorage.setItem('accessToken', 'some-token');

      createServiceWithStorage();

      expect(service.isAuthenticated()).toBeFalse();
    });
  });
});
