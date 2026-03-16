export interface Role {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  isSystem: boolean;
  usersCount: number;
  createdAt: string;
  lastModifiedAt: string | null;
}

export interface RoleDetail extends Role {
  permissions: Permission[];
}

export interface Permission {
  id: string;
  resource: string;
  action: string;
  description: string;
}

export interface PermissionGroup {
  resource: string;
  permissions: Permission[];
}

export interface CreateRoleRequest {
  name: string;
  description: string;
}

export interface UpdateRoleRequest {
  name: string;
  description: string;
  isActive: boolean;
}

export interface AssignPermissionsRequest {
  permissionIds: string[];
}

export interface UserPermissions {
  userId: string;
  roleName: string;
  permissions: Permission[];
}
