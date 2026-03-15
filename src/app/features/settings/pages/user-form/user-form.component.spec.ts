import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { UserFormComponent } from './user-form.component';
import { UserManagementService } from '../../services/user-management.service';
import { UserManagement } from '../../models/user-management.model';

describe('UserFormComponent', () => {
  let component: UserFormComponent;
  let fixture: ComponentFixture<UserFormComponent>;
  let userService: jasmine.SpyObj<UserManagementService>;
  let router: Router;

  const mockUser: UserManagement = {
    id: '1', firstName: 'John', lastName: 'Doe', email: 'john@test.com',
    role: 'User', isActive: true, createdAt: '2026-01-01T00:00:00Z', lastModifiedAt: null
  };

  function setupModule(routeParams: Record<string, string> = {}): void {
    userService = jasmine.createSpyObj('UserManagementService', [
      'getUserById', 'createUser', 'updateUser'
    ]);

    TestBed.configureTestingModule({
      imports: [UserFormComponent, ReactiveFormsModule],
      providers: [
        provideRouter([]),
        { provide: UserManagementService, useValue: userService },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { params: routeParams } }
        }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(UserFormComponent);
    component = fixture.componentInstance;
  }

  describe('Create mode', () => {
    beforeEach(() => {
      setupModule();
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should be in create mode', () => {
      expect(component.isEditMode()).toBeFalse();
    });

    it('should have empty form', () => {
      expect(component.form.value.firstName).toBe('');
      expect(component.form.value.lastName).toBe('');
      expect(component.form.value.email).toBe('');
      expect(component.form.value.role).toBe('User');
    });

    it('should require all fields in create mode', () => {
      component.form.controls.firstName.setValue('');
      component.form.controls.lastName.setValue('');
      component.form.controls.email.setValue('');
      component.form.controls.password.setValue('');

      expect(component.form.valid).toBeFalse();
    });

    it('should validate email format', () => {
      component.form.controls.email.setValue('invalid');
      expect(component.form.controls.email.valid).toBeFalse();

      component.form.controls.email.setValue('valid@test.com');
      expect(component.form.controls.email.valid).toBeTrue();
    });

    it('should validate password min length', () => {
      component.form.controls.password.setValue('short');
      expect(component.form.controls.password.valid).toBeFalse();

      component.form.controls.password.setValue('Password1');
      expect(component.form.controls.password.valid).toBeTrue();
    });

    it('should call createUser on valid submit', () => {
      userService.createUser.and.returnValue(of('new-id'));

      component.form.patchValue({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        password: 'Password123!',
        role: 'User'
      });

      component.onSubmit();

      expect(userService.createUser).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        password: 'Password123!',
        role: 'User'
      });
    });

    it('should not submit when form is invalid', () => {
      component.onSubmit();
      expect(userService.createUser).not.toHaveBeenCalled();
    });

    it('should show error message on create failure', () => {
      userService.createUser.and.returnValue(
        throwError(() => ({ error: { detail: 'Email duplicado' } }))
      );

      component.form.patchValue({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        password: 'Password123!',
        role: 'User'
      });

      component.onSubmit();

      expect(component.errorMessage()).toBe('Email duplicado');
      expect(component.loading()).toBeFalse();
    });

    it('should show default error message when no detail', () => {
      userService.createUser.and.returnValue(
        throwError(() => ({ error: {} }))
      );

      component.form.patchValue({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        password: 'Password123!',
        role: 'User'
      });

      component.onSubmit();

      expect(component.errorMessage()).toBe('Error al crear el usuario.');
    });
  });

  describe('Edit mode', () => {
    beforeEach(() => {
      setupModule({ id: '1' });
      userService.getUserById.and.returnValue(of(mockUser));
      fixture.detectChanges();
    });

    it('should be in edit mode', () => {
      expect(component.isEditMode()).toBeTrue();
      expect(component.userId()).toBe('1');
    });

    it('should load user data into form', () => {
      expect(component.form.value.firstName).toBe('John');
      expect(component.form.value.lastName).toBe('Doe');
      expect(component.form.value.email).toBe('john@test.com');
      expect(component.form.value.role).toBe('User');
    });

    it('should not require password in edit mode', () => {
      expect(component.form.controls.password.valid).toBeTrue();
    });

    it('should call updateUser on valid submit', () => {
      userService.updateUser.and.returnValue(of(void 0));

      component.form.patchValue({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@test.com',
        role: 'Admin',
        isActive: true
      });

      component.onSubmit();

      expect(userService.updateUser).toHaveBeenCalledWith('1', {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@test.com',
        role: 'Admin',
        isActive: true
      });
    });

    it('should show error on load user failure', () => {
      // Service was already configured with failure in a separate describe
      // Testing via direct method call since TestBed can't be reconfigured
      userService.getUserById.and.returnValue(throwError(() => new Error('Not found')));

      component.ngOnInit();

      expect(component.errorMessage()).toBe('Error al cargar el usuario.');
    });

    it('should show error message on update failure', () => {
      userService.updateUser.and.returnValue(
        throwError(() => ({ error: { detail: 'Error de actualización' } }))
      );

      component.onSubmit();

      expect(component.errorMessage()).toBe('Error de actualización');
    });
  });
});
