import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { authGuard, guestGuard, adminGuard } from './auth.guard';
import { AuthService } from '@core/services/auth.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

describe('authGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  const mockRoute = {} as ActivatedRouteSnapshot;
  const mockState = {} as RouterStateSnapshot;

  beforeEach(() => {
    authService = jasmine.createSpyObj('AuthService', [], {
      isAuthenticated: jasmine.createSpy().and.returnValue(true)
    });
    router = jasmine.createSpyObj('Router', ['createUrlTree']);
    router.createUrlTree.and.returnValue({} as UrlTree);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router }
      ]
    });
  });

  it('should allow access when authenticated', () => {
    (authService.isAuthenticated as jasmine.Spy).and.returnValue(true);

    const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

    expect(result).toBeTrue();
  });

  it('should redirect to login when not authenticated', () => {
    (authService.isAuthenticated as jasmine.Spy).and.returnValue(false);
    const urlTree = {} as UrlTree;
    router.createUrlTree.and.returnValue(urlTree);

    const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

    expect(result).toBe(urlTree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/auth/login']);
  });
});

describe('guestGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  const mockRoute = {} as ActivatedRouteSnapshot;
  const mockState = {} as RouterStateSnapshot;

  beforeEach(() => {
    authService = jasmine.createSpyObj('AuthService', [], {
      isAuthenticated: jasmine.createSpy().and.returnValue(false)
    });
    router = jasmine.createSpyObj('Router', ['createUrlTree']);
    router.createUrlTree.and.returnValue({} as UrlTree);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router }
      ]
    });
  });

  it('should allow access when not authenticated', () => {
    (authService.isAuthenticated as jasmine.Spy).and.returnValue(false);

    const result = TestBed.runInInjectionContext(() => guestGuard(mockRoute, mockState));

    expect(result).toBeTrue();
  });

  it('should redirect to dashboard when authenticated', () => {
    (authService.isAuthenticated as jasmine.Spy).and.returnValue(true);
    const urlTree = {} as UrlTree;
    router.createUrlTree.and.returnValue(urlTree);

    const result = TestBed.runInInjectionContext(() => guestGuard(mockRoute, mockState));

    expect(result).toBe(urlTree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/dashboard']);
  });
});

describe('adminGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  const mockRoute = {} as ActivatedRouteSnapshot;
  const mockState = {} as RouterStateSnapshot;

  beforeEach(() => {
    authService = jasmine.createSpyObj('AuthService', [], {
      user: jasmine.createSpy().and.returnValue({ role: 'Admin' })
    });
    router = jasmine.createSpyObj('Router', ['createUrlTree']);
    router.createUrlTree.and.returnValue({} as UrlTree);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router }
      ]
    });
  });

  it('should allow access when user is Admin', () => {
    (authService.user as jasmine.Spy).and.returnValue({ role: 'Admin' });

    const result = TestBed.runInInjectionContext(() => adminGuard(mockRoute, mockState));

    expect(result).toBeTrue();
  });

  it('should redirect to dashboard when user is not Admin', () => {
    (authService.user as jasmine.Spy).and.returnValue({ role: 'User' });
    const urlTree = {} as UrlTree;
    router.createUrlTree.and.returnValue(urlTree);

    const result = TestBed.runInInjectionContext(() => adminGuard(mockRoute, mockState));

    expect(result).toBe(urlTree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should redirect to dashboard when user is null', () => {
    (authService.user as jasmine.Spy).and.returnValue(null);
    const urlTree = {} as UrlTree;
    router.createUrlTree.and.returnValue(urlTree);

    const result = TestBed.runInInjectionContext(() => adminGuard(mockRoute, mockState));

    expect(result).toBe(urlTree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should redirect to dashboard when user is Manager', () => {
    (authService.user as jasmine.Spy).and.returnValue({ role: 'Manager' });
    const urlTree = {} as UrlTree;
    router.createUrlTree.and.returnValue(urlTree);

    const result = TestBed.runInInjectionContext(() => adminGuard(mockRoute, mockState));

    expect(result).toBe(urlTree);
  });
});
