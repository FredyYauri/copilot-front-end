export interface PermissionManagement {
  id: string;
  resource: string;
  action: string;
  description: string;
  type: string;
  isActive: boolean;
  createdAt: string;
  lastModifiedAt: string | null;
}

export interface CreatePermissionRequest {
  resource: string;
  action: string;
  description: string;
  type: string;
}

export interface UpdatePermissionRequest {
  resource: string;
  action: string;
  description: string;
  type: string;
}

export const PERMISSION_TYPES = [
  { value: 'page', label: 'Página' },
  { value: 'action', label: 'Acción' },
  { value: 'button', label: 'Botón' },
  { value: 'field', label: 'Campo' },
  { value: 'api', label: 'API' }
] as const;
