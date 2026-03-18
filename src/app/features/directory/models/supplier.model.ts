export interface Supplier {
  id: string;
  nombre: string;
  ruc: string | null;
  telefono: string | null;
  direccion: string | null;
  distrito: string | null;
  ciudad: string | null;
  correo: string | null;
  paginaWeb: string | null;
  isActive: boolean;
  createdAt: string;
  lastModifiedAt: string | null;
}

export interface SupplierDetail extends Supplier {
  numeroCuenta: string | null;
  banco: string | null;
  productos: string | null;
  observaciones: string | null;
  contacts: SupplierContact[];
}

export interface SupplierContact {
  id: string;
  nombre: string;
  cargo: string | null;
  telefono: string | null;
  correo: string | null;
}

export interface CreateSupplierRequest {
  nombre: string;
  ruc: string | null;
  telefono: string | null;
  direccion: string | null;
  distrito: string | null;
  ciudad: string | null;
  correo: string | null;
  paginaWeb: string | null;
  numeroCuenta: string | null;
  banco: string | null;
  productos: string | null;
  observaciones: string | null;
  contacts: CreateSupplierContact[] | null;
}

export interface CreateSupplierContact {
  nombre: string;
  cargo: string | null;
  telefono: string | null;
  correo: string | null;
}

export interface UpdateSupplierRequest {
  nombre: string;
  ruc: string | null;
  telefono: string | null;
  direccion: string | null;
  distrito: string | null;
  ciudad: string | null;
  correo: string | null;
  paginaWeb: string | null;
  numeroCuenta: string | null;
  banco: string | null;
  productos: string | null;
  observaciones: string | null;
  isActive: boolean;
  contacts: CreateSupplierContact[] | null;
}

export interface UpdateSupplierContactsRequest {
  contacts: CreateSupplierContact[];
}

export interface SupplierSearch {
  id: string;
  nombre: string;
  ruc: string | null;
  telefono: string | null;
}
