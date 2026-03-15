import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { UserManagementService } from './user-management.service';
import { API_URL } from '@core/models/tokens';
import { PagedResult, UserManagement } from '../models/user-management.model';

describe('UserManagementService', () => {
  let service: UserManagementService;
  let httpTesting: HttpTestingController;
  const apiUrl = 'http://test-api.com/api';

  const mockUser: UserManagement = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@test.com',
    role: 'User',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    lastModifiedAt: null
  };

  const mockPagedResult: PagedResult<UserManagement> = {
    items: [mockUser],
    totalCount: 1,
    page: 1,
    pageSize: 10,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: apiUrl }
      ]
    });

    service = TestBed.inject(UserManagementService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUsers', () => {
    it('should return paged users', () => {
      service.getUsers(1, 10).subscribe(result => {
        expect(result).toEqual(mockPagedResult);
      });

      const req = httpTesting.expectOne(`${apiUrl}/users?page=1&pageSize=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPagedResult);
    });

    it('should use default pagination params', () => {
      service.getUsers().subscribe();

      const req = httpTesting.expectOne(`${apiUrl}/users?page=1&pageSize=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPagedResult);
    });

    it('should propagate errors', () => {
      service.getUsers().subscribe({
        error: (err) => {
          expect(err.status).toBe(500);
        }
      });

      const req = httpTesting.expectOne(`${apiUrl}/users?page=1&pageSize=10`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getUserById', () => {
    it('should return a user by id', () => {
      service.getUserById('1').subscribe(result => {
        expect(result).toEqual(mockUser);
      });

      const req = httpTesting.expectOne(`${apiUrl}/users/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });

    it('should propagate 404 error', () => {
      service.getUserById('999').subscribe({
        error: (err) => {
          expect(err.status).toBe(404);
        }
      });

      const req = httpTesting.expectOne(`${apiUrl}/users/999`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('createUser', () => {
    it('should send POST with user data and return id', () => {
      const request = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        password: 'Password123!',
        role: 'User'
      };

      service.createUser(request).subscribe(result => {
        expect(result).toBe('new-id-123');
      });

      const req = httpTesting.expectOne(`${apiUrl}/users`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush('new-id-123');
    });
  });

  describe('updateUser', () => {
    it('should send PUT with user data', () => {
      const request = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@test.com',
        role: 'Admin',
        isActive: true
      };

      service.updateUser('1', request).subscribe();

      const req = httpTesting.expectOne(`${apiUrl}/users/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(request);
      req.flush(null);
    });
  });

  describe('toggleStatus', () => {
    it('should send PATCH with isActive value', () => {
      service.toggleStatus('1', false).subscribe();

      const req = httpTesting.expectOne(`${apiUrl}/users/1/status`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toBe(false);
      req.flush(null);
    });

    it('should send true to activate', () => {
      service.toggleStatus('1', true).subscribe();

      const req = httpTesting.expectOne(`${apiUrl}/users/1/status`);
      expect(req.request.body).toBe(true);
      req.flush(null);
    });
  });

  describe('changeRole', () => {
    it('should send PATCH with role value', () => {
      service.changeRole('1', 'Admin').subscribe();

      const req = httpTesting.expectOne(`${apiUrl}/users/1/role`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toBe('"Admin"');
      req.flush(null);
    });

    it('should set Content-Type to application/json', () => {
      service.changeRole('1', 'Manager').subscribe();

      const req = httpTesting.expectOne(`${apiUrl}/users/1/role`);
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      req.flush(null);
    });
  });
});
