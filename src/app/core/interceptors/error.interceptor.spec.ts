import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    router = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: router }
      ]
    });
  });

  it('should pass through successful responses', (done: DoneFn) => {
    const req = new HttpRequest('GET', '/api/test');
    const mockResponse = new HttpResponse({ status: 200, body: { data: 'test' } });
    const next = () => of(mockResponse);

    TestBed.runInInjectionContext(() => {
      const result$ = errorInterceptor(req, next as any);
      result$.subscribe({
        next: (response) => {
          expect(response).toEqual(mockResponse);
          done();
        }
      });
    });
  });

  it('should clear session and redirect on 401 error', (done: DoneFn) => {
    sessionStorage.setItem('accessToken', 'some-token');
    const req = new HttpRequest('GET', '/api/test');
    const error = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
    const next = () => throwError(() => error);

    TestBed.runInInjectionContext(() => {
      const result$ = errorInterceptor(req, next as any);
      result$.subscribe({
        error: (err) => {
          expect(err.status).toBe(401);
          expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
          expect(sessionStorage.getItem('accessToken')).toBeNull();
          done();
        }
      });
    });
  });

  it('should rethrow non-401 errors without redirect', (done: DoneFn) => {
    const req = new HttpRequest('GET', '/api/test');
    const error = new HttpErrorResponse({ status: 500, statusText: 'Server Error' });
    const next = () => throwError(() => error);

    TestBed.runInInjectionContext(() => {
      const result$ = errorInterceptor(req, next as any);
      result$.subscribe({
        error: (err) => {
          expect(err.status).toBe(500);
          expect(router.navigate).not.toHaveBeenCalled();
          done();
        }
      });
    });
  });

  afterEach(() => {
    sessionStorage.clear();
  });
});
