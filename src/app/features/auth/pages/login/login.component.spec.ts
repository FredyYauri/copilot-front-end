import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '@core/services/auth.service';
import { LoginResponse, User } from '@core/models/user.model';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  const mockUser: User = {
    id: '1', email: 'test@test.com', firstName: 'John', lastName: 'Doe', role: 'admin'
  };

  const mockLoginResponse: LoginResponse = {
    accessToken: 'token-123',
    refreshToken: 'refresh-456',
    user: mockUser
  };

  beforeEach(async () => {
    authService = jasmine.createSpyObj('AuthService', ['login']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.form.value).toEqual({ email: '', password: '' });
    expect(component.loading()).toBeFalse();
    expect(component.errorMessage()).toBe('');
  });

  it('should have invalid form when empty', () => {
    expect(component.form.valid).toBeFalse();
  });

  it('should validate email field', () => {
    const email = component.form.controls.email;

    email.setValue('');
    expect(email.hasError('required')).toBeTrue();

    email.setValue('invalid');
    expect(email.hasError('email')).toBeTrue();

    email.setValue('test@test.com');
    expect(email.valid).toBeTrue();
  });

  it('should validate password field', () => {
    const password = component.form.controls.password;

    password.setValue('');
    expect(password.hasError('required')).toBeTrue();

    password.setValue('short');
    expect(password.hasError('minlength')).toBeTrue();

    password.setValue('validpass');
    expect(password.valid).toBeTrue();
  });

  describe('onSubmit', () => {
    it('should not call login when form is invalid', () => {
      component.onSubmit();

      expect(authService.login).not.toHaveBeenCalled();
    });

    it('should login and navigate to dashboard on success', () => {
      authService.login.and.returnValue(of(mockLoginResponse));

      component.form.setValue({ email: 'test@test.com', password: 'password1' });
      component.onSubmit();

      expect(authService.login).toHaveBeenCalledWith({ email: 'test@test.com', password: 'password1' });
      expect(component.loading()).toBeFalse();
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should show error message when login returns null', () => {
      authService.login.and.returnValue(of(null));

      component.form.setValue({ email: 'test@test.com', password: 'password1' });
      component.onSubmit();

      expect(component.loading()).toBeFalse();
      expect(component.errorMessage()).toBe('Credenciales incorrectas. Intenta de nuevo.');
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should show connection error message on error', () => {
      authService.login.and.returnValue(throwError(() => new Error('Network error')));

      component.form.setValue({ email: 'test@test.com', password: 'password1' });
      component.onSubmit();

      expect(component.loading()).toBeFalse();
      expect(component.errorMessage()).toBe('Error de conexión. Intenta más tarde.');
    });

    it('should set loading to true during login', () => {
      authService.login.and.returnValue(of(mockLoginResponse));

      component.form.setValue({ email: 'test@test.com', password: 'password1' });

      // Check loading is set before subscribe resolves
      authService.login.and.callFake(() => {
        expect(component.loading()).toBeTrue();
        expect(component.errorMessage()).toBe('');
        return of(mockLoginResponse);
      });

      component.onSubmit();
    });
  });

  describe('onCancel', () => {
    it('should reset form and clear error message', () => {
      component.form.setValue({ email: 'test@test.com', password: 'password1' });
      component.errorMessage.set('Some error');

      component.onCancel();

      expect(component.form.value).toEqual({ email: '', password: '' });
      expect(component.errorMessage()).toBe('');
    });
  });
});
