import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ForgotPasswordComponent } from './forgot-password.component';
import { AuthService } from '@core/services/auth.service';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj('AuthService', ['forgotPassword']);

    await TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent, ReactiveFormsModule],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form and default state', () => {
    expect(component.form.value).toEqual({ email: '' });
    expect(component.loading()).toBeFalse();
    expect(component.success()).toBeFalse();
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

  describe('onSubmit', () => {
    it('should not call forgotPassword when form is invalid', () => {
      component.onSubmit();

      expect(authService.forgotPassword).not.toHaveBeenCalled();
    });

    it('should show success and reset form on success', () => {
      authService.forgotPassword.and.returnValue(of(true));

      component.form.setValue({ email: 'test@test.com' });
      component.onSubmit();

      expect(authService.forgotPassword).toHaveBeenCalledWith({ email: 'test@test.com' });
      expect(component.loading()).toBeFalse();
      expect(component.success()).toBeTrue();
      expect(component.form.value).toEqual({ email: '' });
    });

    it('should show error when forgotPassword returns false', () => {
      authService.forgotPassword.and.returnValue(of(false));

      component.form.setValue({ email: 'test@test.com' });
      component.onSubmit();

      expect(component.loading()).toBeFalse();
      expect(component.success()).toBeFalse();
      expect(component.errorMessage()).toBe('No se pudo procesar la solicitud.');
    });

    it('should show connection error on error', () => {
      authService.forgotPassword.and.returnValue(throwError(() => new Error('Network error')));

      component.form.setValue({ email: 'test@test.com' });
      component.onSubmit();

      expect(component.loading()).toBeFalse();
      expect(component.errorMessage()).toBe('Error de conexión. Intenta más tarde.');
    });

    it('should set loading to true and clear state during submit', () => {
      authService.forgotPassword.and.callFake(() => {
        expect(component.loading()).toBeTrue();
        expect(component.errorMessage()).toBe('');
        expect(component.success()).toBeFalse();
        return of(true);
      });

      component.form.setValue({ email: 'test@test.com' });
      component.onSubmit();
    });
  });
});
