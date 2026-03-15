import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, HttpRequest, HttpResponse } from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '@core/services/auth.service';

describe('authInterceptor', () => {
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    authService = jasmine.createSpyObj('AuthService', [], {
      accessToken: jasmine.createSpy().and.returnValue('test-token')
    });

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authService }
      ]
    });
  });

  it('should add Authorization header when token exists', () => {
    (authService.accessToken as jasmine.Spy).and.returnValue('my-token');

    const req = new HttpRequest('GET', '/api/test');
    const next = jasmine.createSpy('next').and.callFake((r: HttpRequest<unknown>) => {
      expect(r.headers.get('Authorization')).toBe('Bearer my-token');
      return new HttpResponse({ status: 200 });
    });

    TestBed.runInInjectionContext(() => {
      authInterceptor(req, next);
    });

    expect(next).toHaveBeenCalled();
  });

  it('should not add Authorization header when token is null', () => {
    (authService.accessToken as jasmine.Spy).and.returnValue(null);

    const req = new HttpRequest('GET', '/api/test');
    const next = jasmine.createSpy('next').and.callFake((r: HttpRequest<unknown>) => {
      expect(r.headers.has('Authorization')).toBeFalse();
      return new HttpResponse({ status: 200 });
    });

    TestBed.runInInjectionContext(() => {
      authInterceptor(req, next);
    });

    expect(next).toHaveBeenCalled();
  });
});
