import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError, NEVER } from 'rxjs';
import { UserListComponent } from './user-list.component';
import { UserManagementService } from '../../services/user-management.service';
import { PagedResult, UserManagement } from '../../models/user-management.model';

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let userService: jasmine.SpyObj<UserManagementService>;

  const mockUsers: UserManagement[] = [
    {
      id: '1', firstName: 'John', lastName: 'Doe', email: 'john@test.com',
      role: 'Admin', isActive: true, createdAt: '2026-01-01T00:00:00Z', lastModifiedAt: null
    },
    {
      id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@test.com',
      role: 'User', isActive: false, createdAt: '2026-01-02T00:00:00Z', lastModifiedAt: null
    }
  ];

  const mockPagedResult: PagedResult<UserManagement> = {
    items: mockUsers,
    totalCount: 2,
    page: 1,
    pageSize: 10,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false
  };

  beforeEach(async () => {
    userService = jasmine.createSpyObj('UserManagementService', [
      'getUsers', 'toggleStatus'
    ]);
    userService.getUsers.and.returnValue(of(mockPagedResult));

    await TestBed.configureTestingModule({
      imports: [UserListComponent],
      providers: [
        provideRouter([]),
        { provide: UserManagementService, useValue: userService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load users on init', () => {
    fixture.detectChanges();

    expect(userService.getUsers).toHaveBeenCalledWith(1, 10);
    expect(component.users()).toEqual(mockUsers);
    expect(component.totalCount()).toBe(2);
    expect(component.loading()).toBeFalse();
  });

  it('should display users in the table', () => {
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('John');
    expect(rows[0].textContent).toContain('Doe');
    expect(rows[1].textContent).toContain('Jane');
  });

  it('should display empty message when no users', () => {
    userService.getUsers.and.returnValue(of({
      ...mockPagedResult,
      items: [],
      totalCount: 0
    }));

    fixture.detectChanges();

    const emptyCell = fixture.nativeElement.querySelector('.user-list__empty');
    expect(emptyCell).toBeTruthy();
    expect(emptyCell.textContent).toContain('No hay usuarios registrados');
  });

  it('should show error message on service error', () => {
    userService.getUsers.and.returnValue(throwError(() => new Error('Error')));

    fixture.detectChanges();

    expect(component.errorMessage()).toBe('Error al cargar los usuarios.');
    expect(component.loading()).toBeFalse();
  });

  it('should call toggleStatus and reload users', () => {
    fixture.detectChanges();
    userService.toggleStatus.and.returnValue(of(void 0));
    userService.getUsers.calls.reset();

    component.onToggleStatus(mockUsers[0]);

    expect(userService.toggleStatus).toHaveBeenCalledWith('1', false);
  });

  it('should navigate to next page', () => {
    fixture.detectChanges();

    component.goToPage(2);

    expect(component.currentPage()).toBe(2);
    expect(userService.getUsers).toHaveBeenCalledWith(2, 10);
  });

  it('should show loading state', () => {
    userService.getUsers.and.returnValue(NEVER);
    fixture.detectChanges();

    const loadingEl = fixture.nativeElement.querySelector('.user-list__loading');
    expect(loadingEl).toBeTruthy();
    expect(loadingEl.textContent).toContain('Cargando');
  });

  it('should show error on toggle status failure', () => {
    fixture.detectChanges();
    userService.toggleStatus.and.returnValue(throwError(() => new Error('Error')));

    component.onToggleStatus(mockUsers[0]);

    expect(component.errorMessage()).toContain('Error al cambiar el estado');
  });
});
