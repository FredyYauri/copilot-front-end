export interface UserManagement {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roleId: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastModifiedAt: string | null;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roleId: string;
}

export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  roleId: string;
  isActive: boolean;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
